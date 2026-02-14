import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @Length(1, 200)
  title: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsString()
  @Length(1, 20000)
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  tags?: string[];
}
