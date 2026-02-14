import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users/user.entity';
import { DoctorProfile } from './users/doctor-profile.entity';

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, DoctorProfile],
  synchronize: true,
});

async function testDb() {
  await ds.initialize();
  const repo = ds.getRepository(User);

  // 查找超级管理员
  const admin = await repo
    .createQueryBuilder('u')
    .addSelect('u.passwordHash')
    .where('u.email = :email', { email: 'admin@example.com' })
    .getOne();

  console.log('Admin user found:', admin);

  if (admin && admin.passwordHash) {
    // 测试密码验证
    const isValid = await bcrypt.compare('Admin#123456', admin.passwordHash);
    console.log('Password validation:', isValid);
  }

  process.exit(0);
}

testDb().catch(console.error);
