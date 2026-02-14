import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ForumPostPriority, ForumPostStatus } from '../entities/post.entity';

export class HospitalQueryPostsDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @Type(() => Number) @IsInt() categoryId?: number;
  @IsOptional() @IsEnum(ForumPostPriority) priority?: ForumPostPriority;
  @IsOptional() @IsEnum(ForumPostStatus) status?: ForumPostStatus;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsBooleanString() hasOfficialReply?: string; // 'true' | 'false'
  @IsOptional() @IsString() sortBy?:
    | 'latestReply'
    | 'latestPost'
    | 'mostLiked'
    | 'mostReplied';

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) pageSize = 10;
}
