import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { User } from '../users/user.entity';
import type { AuthUser } from './auth-user';

interface JwtPayload {
  sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {
    // 自定义提取器：优先从 Authorization Bearer 读取，其次从查询参数 token 读取
    const fromQueryToken = (req: Request): string | null => {
      const token = req.query?.token;
      return typeof token === 'string' ? token : null;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        fromQueryToken,
      ]),
      secretOrKey:
        process.env.JWT_SECRET || 'dev_secret_change_me_in_production',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const userId = Number(payload.sub);
    if (!userId) {
      throw new UnauthorizedException('无效令牌');
    }

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || !user.enabled) {
      throw new UnauthorizedException('用户不存在或已停用');
    }

    return {
      id: user.id,
      sub: user.id,
      role: user.role,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
    };
  }
}
