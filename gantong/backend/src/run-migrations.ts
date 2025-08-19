import 'dotenv/config'
import { DataSource } from 'typeorm'
import { User } from './users/user.entity'
import { DoctorProfile } from './users/doctor-profile.entity'
import { Video } from './videos/video.entity'
import { CaseRecord } from './cases/entities/case-record.entity'
import { CaseFile } from './cases/entities/case-file.entity'
import { Training } from './trainings/entities/training.entity'
import { TrainingBooking } from './trainings/entities/booking.entity'

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, DoctorProfile, Video, CaseRecord, CaseFile, Training, TrainingBooking],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
})

async function run() {
  await dataSource.initialize()
  await dataSource.runMigrations()
  await dataSource.destroy()
  // eslint-disable-next-line no-console
  console.log('Migrations executed successfully')
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

