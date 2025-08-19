import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { DoctorsModule } from './doctors/doctors.module';
import { VideosModule } from './videos/videos.module';
import { User } from './users/user.entity';
import { DoctorProfile } from './users/doctor-profile.entity';
import { Video } from './videos/video.entity';
import { CasesModule } from './cases/cases.module';
import { TrainingsModule } from './trainings/trainings.module';
import { Training } from './trainings/entities/training.entity';
import { TrainingBooking } from './trainings/entities/booking.entity';
import { GrowthModule } from './growth/growth.module';
import { Child } from './growth/entities/child.entity';
import { GrowthProfile } from './growth/entities/growth-profile.entity';
import { HealthRecord } from './growth/entities/health-record.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, DoctorProfile, Video, Training, TrainingBooking, Child, GrowthProfile, HealthRecord],
      synchronize: false, // 改为 false 以保护现有数据
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    AdminModule,
    DoctorsModule,
    VideosModule,
    CasesModule,
    TrainingsModule,
    GrowthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
