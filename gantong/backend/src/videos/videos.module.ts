import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Video } from './video.entity';
import { User } from '../users/user.entity';
import { DoctorProfile } from '../users/doctor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video, User, DoctorProfile])],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
