import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // 自定义提取器：优先从 Authorization Bearer 读取，其次从查询参数 token 读取
    const fromQueryToken = (req: any) => {
      const t = req?.query?.token
      return typeof t === 'string' ? t : null
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        fromQueryToken,
      ]),
      secretOrKey: process.env.JWT_SECRET || 'dev_secret_change_me_in_production',
    })
  }

  async validate(payload: any) {
    return { id: payload.sub, role: payload.role }
  }
}
