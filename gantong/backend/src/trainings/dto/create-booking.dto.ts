import { IsInt, IsString, IsOptional, IsISO8601, Min, MaxLength } from 'class-validator'

export class CreateTrainingBookingDto {
  @IsInt()
  trainingId: number

  @IsString()
  @MaxLength(50)
  childName: string

  @IsInt()
  @Min(1)
  childAge: number

  @IsString()
  @MaxLength(10)
  childGender: string

  @IsString()
  @MaxLength(50)
  parentName: string

  @IsString()
  @MaxLength(30)
  parentPhone: string

  @IsOptional()
  @IsISO8601()
  preferredDate?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  preferredTime?: string

  @IsOptional()
  @IsString()
  symptoms?: string

  @IsOptional()
  @IsString()
  previousTreatment?: string
}

