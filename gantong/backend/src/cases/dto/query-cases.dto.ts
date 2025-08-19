import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { CaseStatus } from '../entities/case-record.entity'

export class QueryCasesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10

  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus
}

