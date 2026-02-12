import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorAppointment } from './entities/doctor-appointment.entity';
import { ParentAppointmentsController } from './parent-appointments.controller';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { DoctorProfile } from '../users/doctor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorAppointment, DoctorProfile])],
  controllers: [ParentAppointmentsController, AdminAppointmentsController],
})
export class AppointmentsModule {}
