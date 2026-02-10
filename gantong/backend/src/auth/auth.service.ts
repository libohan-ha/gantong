import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('email 或 phone 至少一个');
    }

    const exists = await this.users.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });

    if (exists) {
      throw new BadRequestException('用户已存在');
    }

    const selfRegisterRoles = new Set<Role>([
      Role.PARENT,
      Role.DOCTOR,
      Role.SCHOOL_ADMIN,
    ]);
    const role =
      dto.role && selfRegisterRoles.has(dto.role as Role)
        ? (dto.role as Role)
        : Role.PARENT;

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role,
    });

    await this.users.save(user);
    return this.sign(user);
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('email 或 phone 至少一个');
    }

    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where(
        dto.email ? 'u.email = :email' : 'u.phone = :phone',
        dto.email ? { email: dto.email } : { phone: dto.phone },
      )
      .getOne();

    if (!user || !user.passwordHash || !user.enabled) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);

    if (!ok) {
      throw new UnauthorizedException('账号或密码错误');
    }

    return this.sign(user);
  }

  sign(user: User) {
    const payload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        phone: user.phone,
      },
    };
  }
}
