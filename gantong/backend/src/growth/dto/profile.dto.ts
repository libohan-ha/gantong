import { ArrayMaxSize, IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class UpsertGrowthProfileDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(200)
  heightCm?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(5)
  @Max(100)
  weightKg?: number

  @IsOptional()
  @IsDateString()
  lastPhysicalUpdated?: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @MaxLength(50, { each: true })
  behaviorStrengths?: string[]

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @MaxLength(50, { each: true })
  behaviorChallenges?: string[]

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @MaxLength(50, { each: true })
  behaviorImprovements?: string[]

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  dailySelfCare?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  dailyCommunication?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  dailySocial?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  dailyMotor?: number
}

