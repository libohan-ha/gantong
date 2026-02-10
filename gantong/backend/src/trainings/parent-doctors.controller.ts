import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { DoctorProfile } from '../users/doctor-profile.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
@Controller('parent/experts')
export class ParentDoctorsController {
  constructor(
    @InjectRepository(DoctorProfile)
    private readonly doctorsRepo: Repository<DoctorProfile>,
  ) {}

  // 家长端：医生列表（与培训解耦）
  @Get('doctors')
  async listDoctors(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('q') q?: string,
  ) {
    const qb = this.doctorsRepo
      .createQueryBuilder('p')
      .where(`p.name <> '' AND p.hospital <> ''`);

    if (q && q.trim()) {
      qb.andWhere('(p.name ILIKE :kw OR p.hospital ILIKE :kw)', {
        kw: `%${q.trim()}%`,
      });
    }

    qb.orderBy('p.userId', 'DESC')
      .skip((+page - 1) * +pageSize)
      .take(+pageSize);

    const [rows, total] = await qb.getManyAndCount();

    return {
      items: rows.map((r) => ({
        doctorId: r.userId,
        name: r.name,
        title: r.title ?? '',
        hospital: r.hospital,
      })),
      total,
      page: +page,
      pageSize: +pageSize,
    };
  }
}
