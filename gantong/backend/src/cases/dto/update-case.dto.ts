import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCaseDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  @IsIn(['online', 'offline'])
  caseType?: 'online' | 'offline';
}
