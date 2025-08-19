import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DoctorsController } from './doctors.controller'
import { DoctorProfile } from '../users/doctor-profile.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorProfile])
  ],
  controllers: [DoctorsController],
  exports: [TypeOrmModule]
})
export class DoctorsModule {}
