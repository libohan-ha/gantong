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

async function resetAdmin() {
  await ds.initialize()
  const repo = ds.getRepository(User)
  const email = process.env.SUPERADMIN_EMAIL!
  
  // 删除现有的超级管理员
  await repo.delete({ email })
  console.log('Deleted existing admin')
  
  // 创建新的超级管理员
  const passwordHash = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD!, 10)
  console.log('Generated hash:', passwordHash)
  
  const u = repo.create({
    email,
    role: Role.SUPER_ADMIN,
    passwordHash,
  })
  
  await repo.save(u)
  console.log('New superadmin created:', email)
  
  // 验证密码
  const testUser = await repo
    .createQueryBuilder('u')
    .addSelect('u.passwordHash')
    .where('u.email = :email', { email })
    .getOne()
    
  if (testUser && testUser.passwordHash) {
    const isValid = await bcrypt.compare(process.env.SUPERADMIN_PASSWORD!, testUser.passwordHash)
    console.log('Password verification:', isValid)
  }
  
  process.exit(0)
}

resetAdmin().catch(console.error)
