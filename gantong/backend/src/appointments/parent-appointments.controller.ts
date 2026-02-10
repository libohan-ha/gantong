import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorAppointment } from './entities/doctor-appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { getAuthUserId, type AuthRequest } from '../auth/auth-user';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
@Controller('parent')
export class ParentAppointmentsController {
  constructor(
    @InjectRepository(DoctorAppointment)
    private readonly appointmentRepo: Repository<DoctorAppointment>,
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
}
