import { IsDateString, IsInt, IsOptional, IsString, Length, MaxLength } from 'class-validator'

export class CreateHealthRecordDto {
  @IsDateString()
  date: string

  @IsString()
  @Length(1, 50)
  type: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  result?: string
}

export class UpdateHealthRecordDto {
  @IsOptional()
  @IsDateString()
  date?: string

  @IsOptional()
  @IsString()
  @Length(1, 50)
  type?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  result?: string
}

