import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { getAuthUserId, type AuthRequest } from '../auth/auth-user';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
@Controller('parent/forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // categories
  @Post('posts')
  async createPost(@Req() req: AuthRequest, @Body() dto: CreatePostDto) {
    return this.forumService.createPost(getAuthUserId(req), dto);
  }

  @Post('posts/:id/like')
  async like(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.forumService.togglePostLike(id, getAuthUserId(req));
  }

  @Post('posts/:id/replies')
  async reply(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReplyDto,
  ) {
    return this.forumService.createReply(getAuthUserId(req), id, dto);
  }

  @Get('categories')
  async categories() {
    return this.forumService.listCategories();
  }

  // posts
  @Get('posts')
  async listPosts(@Query() q: QueryPostsDto) {
    return this.forumService.listPosts(q);
  }

  @Get('posts/:id')
  async getPost(@Param('id', ParseIntPipe) id: number) {
    return this.forumService.getPost(id);
  }

  // replies
  @Get('posts/:id/replies')
  async listReplies(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.forumService.listReplies(id, Number(page), Number(pageSize));
  }
}
