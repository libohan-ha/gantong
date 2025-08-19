import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, MaxLength } from 'class-validator'
import type { Gender } from '../entities/child.entity'

export class CreateChildDto {
  @IsString()
  @Length(1, 50)
  name: string

  @IsEnum(['男','女','未知'], { message: 'gender must be 男/女/未知' })
  gender: Gender

  @IsDateString()
  birthDate: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatarUrl?: string
}

export class UpdateChildDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string

  @IsOptional()
  @IsEnum(['男','女','未知'])
  gender?: Gender

  @IsOptional()
  @IsDateString()
  birthDate?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatarUrl?: string
}

