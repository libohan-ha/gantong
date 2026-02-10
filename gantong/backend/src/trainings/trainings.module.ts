import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';
import { Training } from './entities/training.entity';
import { ParentExpertsController } from './parent-experts.controller';
import { TrainingBooking } from './entities/booking.entity';
import { ParentBookingsController } from './parent-bookings.controller';
import { DoctorProfile } from '../users/doctor-profile.entity';
import { ParentDoctorsController } from './parent-doctors.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Training, TrainingBooking, DoctorProfile]),
  ],
  controllers: [
    TrainingsController,
    ParentExpertsController,
    ParentBookingsController,
    ParentDoctorsController,
  ],
  providers: [TrainingsService],
})
export class TrainingsModule {}
