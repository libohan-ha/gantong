import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsISO8601,
} from 'class-validator';
import { TrainingType } from '../entities/training.entity';

export class UpdateTrainingDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsEnum(TrainingType)
  type?: TrainingType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  durationHours?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  maxParticipants?: number;

  @IsOptional()
  @IsISO8601()
  startDate?: string;
}
