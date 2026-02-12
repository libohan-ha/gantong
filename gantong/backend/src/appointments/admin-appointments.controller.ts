import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { DoctorAppointment } from './entities/doctor-appointment.entity';
import { getAuthUser, type AuthRequest } from '../auth/auth-user';
import { DoctorProfile } from '../users/doctor-profile.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.DOCTOR)
@Controller('admin/appointments')
export class AdminAppointmentsController {
  constructor(
    @InjectRepository(DoctorAppointment)
    private readonly appointmentRepo: Repository<DoctorAppointment>,
    @InjectRepository(DoctorProfile)
    private readonly doctorProfileRepo: Repository<DoctorProfile>,
  ) {}

  @Get()
  async list(
    @Req() req: AuthRequest,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    const user = getAuthUser(req);

    // 使用 QueryBuilder（不联表）实现分页与模糊搜索，避免 getRawAndEntities 的复杂性
    const qb = this.appointmentRepo
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC');

    if (status && status !== 'all')
      qb.andWhere('a.status = :status', { status });
    if (q && q.trim()) {
      const kw = `%${q.trim()}%`;
      qb.andWhere(
        '(a.child_name ILIKE :kw OR a.parent_name ILIKE :kw OR a.parent_phone ILIKE :kw OR a.symptoms ILIKE :kw)',
        { kw },
      );
    }

    // 如果是医生账号，只能查看分配给自己的预约
    if (user.role === Role.DOCTOR) {
      qb.andWhere('a.doctor_user_id = :uid', { uid: user.id });
    }

    const [items, total] = await qb
      .skip((+page - 1) * +pageSize)
      .take(+pageSize)
      .getManyAndCount();

    const doctorUserIds = Array.from(new Set(items.map((item) => item.doctorUserId)));
    const doctorProfiles =
      doctorUserIds.length > 0
        ? await this.doctorProfileRepo.find({ where: { userId: In(doctorUserIds) } })
        : [];
    const profileMap = new Map(doctorProfiles.map((p) => [p.userId, p]));

    const mappedItems = items.map((item) => {
      const profile = profileMap.get(item.doctorUserId);
      return {
        ...item,
        doctorName: profile?.name ?? '',
        doctorHospital: profile?.hospital ?? '',
      };
    });

    return { items: mappedItems, total, page: +page, pageSize: +pageSize };
  }
  @Patch(':id')
  async updateStatus(
    @Param('id') id: number,
    @Body()
    body: {
      status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
      notes?: string;
    },
  ) {
    const appt = await this.appointmentRepo.findOne({ where: { id: +id } });
    if (!appt) return { success: false, message: '预约不存在' };

    appt.status = body.status;
    if (body.notes !== undefined) appt.notes = body.notes ?? null;
    await this.appointmentRepo.save(appt);
    return { success: true };
  }
}
