import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DoctorAppointment } from './entities/doctor-appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { getAuthUserId, type AuthRequest } from '../auth/auth-user';
import { DoctorProfile } from '../users/doctor-profile.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
@Controller('parent')
export class ParentAppointmentsController {
  constructor(
    @InjectRepository(DoctorAppointment)
    private readonly appointmentRepo: Repository<DoctorAppointment>,
    @InjectRepository(DoctorProfile)
    private readonly doctorProfileRepo: Repository<DoctorProfile>,
  ) {}

  @Post('appointments')
  async create(@Req() req: AuthRequest, @Body() dto: CreateAppointmentDto) {
    const parentUserId = getAuthUserId(req);

    const appointment = this.appointmentRepo.create({
      parentUserId,
      doctorUserId: dto.doctorId,
      childName: dto.childName,
      childAge: dto.childAge,
      childGender: dto.childGender,
      parentName: dto.parentName,
      parentPhone: dto.parentPhone,
      preferredDate: dto.preferredDate ?? null,
      preferredTime: dto.preferredTime ?? null,
      symptoms: dto.symptoms ?? null,
      previousTreatment: dto.previousTreatment ?? null,
      status: 'pending',
    });

    const saved = await this.appointmentRepo.save(appointment);
    return { id: saved.id, success: true };
  }

  @Get('appointments/mine')
  async mine(
    @Req() req: AuthRequest,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: string,
  ) {
    const parentUserId = getAuthUserId(req);
    const safePage = Math.max(Number(page) || 1, 1);
    const safePageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);

    const qb = this.appointmentRepo
      .createQueryBuilder('a')
      .where('a.parent_user_id = :parentUserId', { parentUserId });

    if (status && status !== 'all') {
      qb.andWhere('a.status = :status', { status });
    }

    const [items, total] = await qb
      .orderBy('a.created_at', 'DESC')
      .skip((safePage - 1) * safePageSize)
      .take(safePageSize)
      .getManyAndCount();

    const doctorUserIds = Array.from(new Set(items.map((it) => it.doctorUserId)));

    const doctorProfiles =
      doctorUserIds.length > 0
        ? await this.doctorProfileRepo.find({
            where: { userId: In(doctorUserIds) },
          })
        : [];

    const profileMap = new Map(
      doctorProfiles.map((profile) => [profile.userId, profile]),
    );

    return {
      items: items.map((item) => {
        const doctorProfile = profileMap.get(item.doctorUserId);
        return {
          id: item.id,
          doctorUserId: item.doctorUserId,
          doctorName: doctorProfile?.name ?? '',
          doctorHospital: doctorProfile?.hospital ?? '',
          doctorTitle: doctorProfile?.title ?? '',
          childName: item.childName,
          childAge: item.childAge,
          childGender: item.childGender,
          parentName: item.parentName,
          parentPhone: item.parentPhone,
          preferredDate: item.preferredDate,
          preferredTime: item.preferredTime,
          symptoms: item.symptoms,
          previousTreatment: item.previousTreatment,
          status: item.status,
          notes: item.notes,
          createdAt: item.createdAt,
        };
      }),
      total,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  @Patch('appointments/:id/cancel')
  async cancel(
    @Req() req: AuthRequest,
    @Param('id') id: number,
    @Body() body?: { reason?: string },
  ) {
    const parentUserId = getAuthUserId(req);
    const appointmentId = Number(id);

    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId, parentUserId },
    });

    if (!appointment) {
      throw new NotFoundException('预约不存在或无权限操作');
    }

    if (appointment.status !== 'pending') {
      throw new BadRequestException('仅待处理状态的预约可取消');
    }

    appointment.status = 'cancelled';
    if (body?.reason && body.reason.trim()) {
      appointment.notes = body.reason.trim();
    }
    await this.appointmentRepo.save(appointment);

    return { success: true };
  }
}
