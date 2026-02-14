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
  @Matches(/^1[3-9]\d{9}$/, {
    message: 'parentPhone 必须为 11 位中国大陆手机号（例如 13800138000）',
  })
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
