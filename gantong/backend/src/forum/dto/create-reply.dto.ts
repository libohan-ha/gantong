import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @Length(1, 10000)
  content: string;

  @IsOptional()
  @IsInt()
  parentReplyId?: number;
}
