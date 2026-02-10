import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { DoctorProfile } from './users/doctor-profile.entity';
import { Video } from './videos/video.entity';
import { CaseRecord } from './cases/entities/case-record.entity';
import { CaseFile } from './cases/entities/case-file.entity';
import { Training } from './trainings/entities/training.entity';
import { TrainingBooking } from './trainings/entities/booking.entity';
import { ForumCategory } from './forum/entities/category.entity';
import { ForumPost } from './forum/entities/post.entity';
import { ForumReply } from './forum/entities/reply.entity';
import { GrowthProfile } from './growth/entities/growth-profile.entity';
import { Child } from './growth/entities/child.entity';
import { HealthRecord } from './growth/entities/health-record.entity';
import { DoctorAppointment } from './appointments/entities/doctor-appointment.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    DoctorProfile,
    Video,
    CaseRecord,
    CaseFile,
    Training,
    TrainingBooking,
    ForumCategory,
    ForumPost,
    ForumReply,
    GrowthProfile,
    Child,
    HealthRecord,
    DoctorAppointment,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});

async function run() {
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();

  console.log('Migrations executed successfully');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
