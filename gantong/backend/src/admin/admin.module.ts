import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/user.entity'
import { DoctorProfile } from '../users/doctor-profile.entity'
import { AdminController } from './admin.controller'

@Module({
  imports: [TypeOrmModule.forFeature([User, DoctorProfile])],
  controllers: [AdminController],
})
export class AdminModule {}
