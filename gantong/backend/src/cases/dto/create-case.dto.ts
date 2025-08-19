import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateCaseDto {
  @IsString()
  @IsNotEmpty({ message: '病例标题不能为空' })
  @MaxLength(200)
  title: string

  @IsString()
  @IsOptional()
  description?: string
}

