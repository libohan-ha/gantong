import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndMerge<string[]>(ROLES_KEY, [
      ctx.getHandler(), 
      ctx.getClass()
    ])
    
    if (!roles || roles.length === 0) return true
    
    const req = ctx.switchToHttp().getRequest()
    const user = req.user
    
    return user && roles.includes(user.role)
  }
}
