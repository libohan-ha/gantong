import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator'
import { Role } from '../../users/user.entity'

export class RegisterDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsString()
  @MinLength(8)
  password!: string

  @IsOptional()
  @IsEnum(Role)
  role?: Role
}
