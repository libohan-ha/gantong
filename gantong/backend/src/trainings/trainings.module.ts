import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrainingsController } from './trainings.controller'
import { TrainingsService } from './trainings.service'
import { Training } from './entities/training.entity'
import { ParentExpertsController } from './parent-experts.controller'
import { TrainingBooking } from './entities/booking.entity'
import { ParentBookingsController } from './parent-bookings.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Training, TrainingBooking])],
  controllers: [TrainingsController, ParentExpertsController, ParentBookingsController],
  providers: [TrainingsService],
})
export class TrainingsModule {}
