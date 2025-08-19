import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, MaxLength } from 'class-validator'
import { VideoDifficulty } from '../video.entity'

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsString()
  @IsNotEmpty()
  category: string

  @IsArray()
  @IsString({ each: true })
  tags: string[]

  @IsArray()
  @IsString({ each: true })
  targetAudience: string[]

  @IsEnum(VideoDifficulty)
  @IsOptional()
  difficulty?: VideoDifficulty
}
