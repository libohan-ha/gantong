import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DoctorProfile } from './doctor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, DoctorProfile])],
  exports: [TypeOrmModule],
})
export class UsersModule {}
