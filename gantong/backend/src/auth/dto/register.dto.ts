import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';
import { Role } from '../../users/user.entity';

const SELF_REGISTER_ROLES = [
  Role.PARENT,
  Role.DOCTOR,
  Role.SCHOOL_ADMIN,
] as const;
type SelfRegisterRole = (typeof SELF_REGISTER_ROLES)[number];

export class RegisterDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsIn(SELF_REGISTER_ROLES)
  role?: SelfRegisterRole;
}
