import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { VideoDifficulty } from '../video.entity';

export class UpdateVideoDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetAudience?: string[];

  @IsEnum(VideoDifficulty)
  @IsOptional()
  difficulty?: VideoDifficulty;
}
