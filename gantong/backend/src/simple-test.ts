import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from './users/user.entity';
import { DoctorProfile } from './users/doctor-profile.entity';

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, DoctorProfile],
  synchronize: true,
});

async function simpleTest() {
  await ds.initialize();
  const userRepo = ds.getRepository(User);

  // 删除现有的超级管理员
  await userRepo.delete({ email: 'admin@example.com' });
  console.log('Deleted existing admin users');

  // 直接创建一个简单的密码哈希
  const password = 'Admin#123456';
  const hash = await bcrypt.hash(password, 10);

  console.log('Password:', password);
  console.log('Hash:', hash);

  // 立即验证这个哈希
  const testResult = await bcrypt.compare(password, hash);
  console.log('Immediate test:', testResult);

  // 创建用户
  const user = userRepo.create({
    email: 'admin@example.com',
    role: Role.SUPER_ADMIN,
    passwordHash: hash,
  });

  await userRepo.save(user);
  console.log('User created with ID:', user.id);

  // 从数据库重新查询并测试
  const dbUser = await userRepo
    .createQueryBuilder('u')
    .addSelect('u.passwordHash')
    .where('u.email = :email', { email: 'admin@example.com' })
    .getOne();

  if (dbUser && dbUser.passwordHash) {
    const dbTest = await bcrypt.compare(password, dbUser.passwordHash);
    console.log('Database test:', dbTest);
    console.log('Hash from DB:', dbUser.passwordHash);
    console.log('Hash matches:', hash === dbUser.passwordHash);
  }

  process.exit(0);
}

simpleTest().catch(console.error);
