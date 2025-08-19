import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './jwt.guard'

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register') 
  register(@Body() dto: RegisterDto) { 
    return this.service.register(dto) 
  }

  @Post('login') 
  login(@Body() dto: LoginDto) { 
    return this.service.login(dto) 
  }

  @UseGuards(JwtAuthGuard)
  @Get('me') 
  me(@Req() req: any) { 
    return req.user 
  }
}
