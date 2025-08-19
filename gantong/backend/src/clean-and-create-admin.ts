import 'dotenv/config'
import { DataSource } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User, Role } from './users/user.entity'
import { DoctorProfile } from './users/doctor-profile.entity'

const ds = new DataSource({ 
  type: 'postgres', 
  url: process.env.DATABASE_URL, 
  entities: [User, DoctorProfile], 
  synchronize: true 
})

async function cleanAndCreateAdmin() {
  await ds.initialize()
  const userRepo = ds.getRepository(User)
  const doctorRepo = ds.getRepository(DoctorProfile)

  // 删除现有的超级管理员
  const email = process.env.SUPERADMIN_EMAIL!
  await userRepo.delete({ email })
  console.log('Deleted existing admin users')
  
  // 创建新的超级管理员
  const password = process.env.SUPERADMIN_PASSWORD!
  
  const passwordHash = await bcrypt.hash(password, 10)
  console.log('Generated hash:', passwordHash)
  
  const u = userRepo.create({
    email,
    role: Role.SUPER_ADMIN,
    passwordHash,
  })
  
  await userRepo.save(u)
  console.log('New superadmin created:', email)
  
  // 验证密码
  const testUser = await userRepo
    .createQueryBuilder('u')
    .addSelect('u.passwordHash')
    .where('u.email = :email', { email })
    .getOne()
    
  if (testUser && testUser.passwordHash) {
    const isValid = await bcrypt.compare(password, testUser.passwordHash)
    console.log('Password verification:', isValid)
    console.log('User ID:', testUser.id)
  }
  
  process.exit(0)
}

cleanAndCreateAdmin().catch(console.error)
