import {
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrainingType } from '../entities/training.entity';

export class QueryTrainingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  // 关键字搜索（标题/医生/医院）
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  // 课程类型筛选
  @IsOptional()
  @IsEnum(TrainingType)
  type?: TrainingType;
}
