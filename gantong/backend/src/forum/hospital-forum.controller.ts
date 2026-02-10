import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../users/user.entity';
import { HospitalForumService } from './hospital-forum.service';
import { HospitalQueryPostsDto } from './dto/hospital-query-posts.dto';
import { ForumPostPriority, ForumPostStatus } from './entities/post.entity';
import {
  getAuthUserId,
  getAuthUserRole,
  type AuthRequest,
} from '../auth/auth-user';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR, Role.SUPER_ADMIN)
@Controller('hospital/forum')
export class HospitalForumController {
  constructor(private readonly service: HospitalForumService) {}

  @Get('posts')
  list(@Query() q: HospitalQueryPostsDto) {
    return this.service.listPosts(q);
  }

  @Get('posts/:id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPost(id);
  }

  @Get('posts/:id/replies')
  listReplies(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.service.listReplies(id, Number(page), Number(pageSize));
  }

  @Post('posts/:id/replies')
  reply(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    b: { content: string; parentReplyId?: number; isOfficial?: boolean },
  ) {
    return this.service.createOfficialOrNormalReply(getAuthUserId(req), id, b);
  }

  @Patch('posts/:id/status')
  setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() b: { status: ForumPostStatus },
  ) {
    return this.service.setStatus(id, b.status);
  }

  @Patch('posts/:id/priority')
  setPriority(
    @Param('id', ParseIntPipe) id: number,
    @Body() b: { priority: ForumPostPriority },
    @Req() req: AuthRequest,
  ) {
    return this.service.setPriority(id, b.priority, getAuthUserRole(req));
  }

  @Delete('posts/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePost(id);
  }

  @Delete('replies/:replyId')
  removeReply(
    @Req() req: AuthRequest,
    @Param('replyId', ParseIntPipe) replyId: number,
  ) {
    return this.service.deleteReply(
      replyId,
      getAuthUserId(req),
      getAuthUserRole(req),
    );
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }
}
