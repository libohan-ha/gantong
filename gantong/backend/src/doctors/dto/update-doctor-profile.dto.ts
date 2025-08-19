import { IsOptional, IsString, IsInt, Min, Max, Length, Matches } from 'class-validator'

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 20, { message: '姓名长度在 2 到 20 个字符' })
  name?: string

  @IsOptional()
  @IsInt({ message: '年龄必须是整数' })
  @Min(18, { message: '年龄必须在 18 到 100 之间' })
  @Max(100, { message: '年龄必须在 18 到 100 之间' })
  age?: number

  @IsOptional()
  @IsString()
  @Length(2, 20, { message: '职称长度在 2 到 20 个字符' })
  title?: string

  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号码' })
  phone?: string

  @IsOptional()
  @IsString()
  @Length(2, 50, { message: '医院名称长度在 2 到 50 个字符' })
  hospital?: string
}
