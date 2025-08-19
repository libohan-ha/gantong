import 'dotenv/config'
import { DataSource } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User, Role } from '../users/user.entity'
import { DoctorProfile } from '../users/doctor-profile.entity'
import { Video } from '../videos/video.entity'

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, DoctorProfile, Video],
  synchronize: true
})

async function run() {
  await ds.initialize()
  const repo = ds.getRepository(User)
  const email = process.env.SUPERADMIN_EMAIL!
  
  const exists = await repo.findOne({ where: { email } })
  if (exists) { 
    console.log('superadmin exists')
    process.exit(0) 
  }
  
  const u = repo.create({
    email,
    role: Role.SUPER_ADMIN,
    passwordHash: await bcrypt.hash(process.env.SUPERADMIN_PASSWORD!, 10),
  })
  
  await repo.save(u)
  console.log('superadmin created:', email)
  process.exit(0)
}

run().catch(console.error)
