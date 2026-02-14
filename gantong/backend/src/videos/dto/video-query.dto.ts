import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { VideoStatus, VideoDifficulty } from '../video.entity';

export class VideoQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  pageSize?: string;

  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(VideoDifficulty)
  difficulty?: VideoDifficulty;

  @IsOptional()
  @IsString()
  q?: string; // 搜索关键词

  @IsOptional()
  @IsString()
  orderBy?: string; // 排序字段，如 'createdAt', 'viewCount', 'likeCount'
}
