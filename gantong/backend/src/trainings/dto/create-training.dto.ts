import { IsString, IsOptional, IsEnum, IsInt, Min, Max, MaxLength, IsISO8601 } from 'class-validator'
import { TrainingType } from '../entities/training.entity'

export class CreateTrainingDto {
  @IsString()
  @MaxLength(200)
  title: string

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @IsEnum(TrainingType)
  type: TrainingType

  @IsInt()
  @Min(1)
  @Max(1000)
  durationHours: number

  @IsInt()
  @Min(1)
  @Max(100000)
  maxParticipants: number

  @IsISO8601()
  startDate: string
}
