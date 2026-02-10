import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  doctorId: number;

  @IsString()
  @IsNotEmpty()
  childName: string;

  @IsInt()
  @Min(0)
  @Max(18)
  childAge: number;

  @IsString()
  @IsNotEmpty()
  childGender: string;

  @IsString()
  @IsNotEmpty()
  parentName: string;

  @IsString()
  @Matches(/^1[3-9]\d{9}$/)
  parentPhone: string;

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsString()
  preferredTime?: string;

  @IsOptional()
  @IsString()
  symptoms?: string;

  @IsOptional()
  @IsString()
  previousTreatment?: string;
}
