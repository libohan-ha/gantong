import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { Training, TrainingType } from './entities/training.entity'
import { CreateTrainingDto } from './dto/create-training.dto'
import { UpdateTrainingDto } from './dto/update-training.dto'
import { TrainingBooking } from './entities/booking.entity'
import { CreateTrainingBookingDto } from './dto/create-booking.dto'

@Injectable()
export class TrainingsService {
  constructor(
    @InjectRepository(Training) private trainingRepo: Repository<Training>,
    @InjectRepository(TrainingBooking) private bookingRepo: Repository<TrainingBooking>,
  ) {}

  async createTraining(doctorUserId: number, dto: CreateTrainingDto) {
    const training = this.trainingRepo.create({
      doctorUserId,
      title: dto.title,
      description: dto.description ?? null,
      type: dto.type,
      durationHours: dto.durationHours,
      maxParticipants: dto.maxParticipants,
      startDate: new Date(dto.startDate),
    })

    return await this.trainingRepo.save(training)
  }

  async findMine(doctorUserId: number, page = 1, pageSize = 10) {
    const [items, total] = await this.trainingRepo.findAndCount({
      where: { doctorUserId },
      order: { createdAt: 'DESC' },
      relations: ['doctor', 'doctor.doctorProfile'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
    return { items, total, page, pageSize }
  }

  async findOneForDoctor(id: number, doctorUserId: number) {
    const training = await this.trainingRepo.findOne({
      where: { id },
      relations: ['doctor', 'doctor.doctorProfile']
    })
    if (!training) throw new NotFoundException('培训不存在')
    if (training.doctorUserId !== doctorUserId) throw new ForbiddenException('无权访问')
    return training
  }

  async updateTraining(id: number, doctorUserId: number, dto: UpdateTrainingDto) {
    const training = await this.findOneForDoctor(id, doctorUserId)

    if (dto.title !== undefined) training.title = dto.title
    if (dto.description !== undefined) training.description = dto.description
    if (dto.type !== undefined) training.type = dto.type
    if (dto.durationHours !== undefined) training.durationHours = dto.durationHours
    if (dto.maxParticipants !== undefined) training.maxParticipants = dto.maxParticipants
    if (dto.startDate !== undefined) training.startDate = new Date(dto.startDate)

    return await this.trainingRepo.save(training)
  }

  async deleteTraining(id: number, doctorUserId: number) {
    const training = await this.findOneForDoctor(id, doctorUserId)
    await this.trainingRepo.remove(training)
    return { success: true }
  }

  // 家长端：公开培训列表（免费 + 单场次），未来的、且医生已验证者优先（若需）
  async findPublicTrainings(page = 1, pageSize = 10, q?: string, type?: TrainingType) {
    const where: FindOptionsWhere<Training>[] = []

    // 仅展示未来的场次
    const now = new Date()

    const base: FindOptionsWhere<Training> = { }
    where.push(base)

    const qb = this.trainingRepo.createQueryBuilder('t')
      .leftJoinAndSelect('t.doctor', 'u')
      .leftJoinAndSelect('u.doctorProfile', 'p')
      .where('t.start_date::date >= CURRENT_DATE')

    if (q && q.trim()) {
      qb.andWhere(
        '(t.title ILIKE :kw OR p.name ILIKE :kw OR p.hospital ILIKE :kw)',
        { kw: `%${q.trim()}%` }
      )
    }
    if (type) qb.andWhere('t.type = :type', { type })

    qb.orderBy('t.start_date', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    const [items, total] = await qb.getManyAndCount()
    return { items, total, page, pageSize }
  }

  // 家长端：公开培训详情
  async findPublicTrainingById(id: number) {
    const training = await this.trainingRepo.findOne({
      where: { id },
      relations: ['doctor', 'doctor.doctorProfile']
    })
    if (!training) throw new NotFoundException('培训不存在')
    return training
  }

  // 家长端：提交预约（免费、落库）
  async createBooking(parentUserId: number, dto: CreateTrainingBookingDto) {
    const training = await this.trainingRepo.findOne({ where: { id: dto.trainingId } })
    if (!training) throw new NotFoundException('培训不存在')
    // 允许预约今天及以后开始的培训；如果需要严格到具体时间，可恢复为 > now()
    const start = new Date(training.startDate)
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const todayDateOnly = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()
    if (startDateOnly < todayDateOnly) {
      throw new BadRequestException('培训已开始或已结束，无法预约')
    }

    const booking = this.bookingRepo.create({
      parentUserId,
      doctorUserId: training.doctorUserId,
      trainingId: training.id,
      childName: dto.childName,
      childAge: dto.childAge,
      childGender: dto.childGender,
      parentName: dto.parentName,
      parentPhone: dto.parentPhone,
      preferredDate: dto.preferredDate ?? null,
      preferredTime: dto.preferredTime ?? null,
      symptoms: dto.symptoms ?? null,
      previousTreatment: dto.previousTreatment ?? null,
    })

    const saved = await this.bookingRepo.save(booking)
    return { id: saved.id, success: true }
  }

  // 家长端：聚合有培训的医生列表（按最近培训时间）
  async listDoctorsWithUpcomingTrainings(page = 1, pageSize = 10, q?: string) {
    const qb = this.trainingRepo.createQueryBuilder('t')
      .innerJoin('t.doctor', 'u')
      .innerJoin('u.doctorProfile', 'p')
      .where('t.start_date::date >= CURRENT_DATE')

    if (q && q.trim()) {
      qb.andWhere('(p.name ILIKE :kw OR p.hospital ILIKE :kw)', { kw: `%${q.trim()}%` })
    }

    // 选择每位医生的最早即将开始的培训时间
    const sub = this.trainingRepo.createQueryBuilder('t2')
      .select('MIN(t2.start_date)')
      .where('t2.doctor_user_id = u.id')
      .andWhere('t2.start_date::date >= CURRENT_DATE')

    qb.select([
      'u.id as doctorId',
      'p.name as name',
      'p.title as title',
      'p.hospital as hospital',
      `(${sub.getQuery()}) as nextStartAt`,
      'COUNT(t.id) as trainingsCount'
    ])
      .setParameters(sub.getParameters())
      .groupBy('u.id')
      .addGroupBy('p.name')
      .addGroupBy('p.title')
      .addGroupBy('p.hospital')
      .orderBy('nextStartAt', 'ASC', 'NULLS LAST')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    const rows = await qb.getRawMany()
    return {
      items: rows.map(r => ({
        doctorId: Number(r.doctorid || r.doctorId),
        name: r.name,
        title: r.title,
        hospital: r.hospital,
        nextStartAt: r.nextstartat || r.nextStartAt,
        trainingsCount: Number(r.trainingscount || r.trainingsCount)
      })),
      total: rows.length, // 如需精确总数可再写 countDistinct
      page,
      pageSize
    }
  }
}
