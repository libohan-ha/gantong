import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { QueryTrainingsDto } from './dto/query-trainings.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { getAuthUserId, type AuthRequest } from '../auth/auth-user';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  // 医生创建培训
  @Post('trainings')
  @Roles(Role.DOCTOR)
  async create(@Body() dto: CreateTrainingDto, @Req() req: AuthRequest) {
    return this.trainingsService.createTraining(getAuthUserId(req), dto);
  }

  // 医生查看自己的培训列表
  @Get('trainings/mine')
  @Roles(Role.DOCTOR)
  async findMine(@Req() req: AuthRequest, @Query() query: QueryTrainingsDto) {
    return this.trainingsService.findMine(
      getAuthUserId(req),
      query.page,
      query.pageSize,
    );
  }

  // 查看单个培训详情（仅限本人）
  @Get('trainings/:id')
  @Roles(Role.DOCTOR)
  async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.trainingsService.findOneForDoctor(+id, getAuthUserId(req));
  }

  // 编辑培训（仅限本人）
  @Patch('trainings/:id')
  @Roles(Role.DOCTOR)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTrainingDto,
    @Req() req: AuthRequest,
  ) {
    return this.trainingsService.updateTraining(+id, getAuthUserId(req), dto);
  }

  // 删除培训（仅限本人）
  @Delete('trainings/:id')
  @Roles(Role.DOCTOR)
  async remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.trainingsService.deleteTraining(+id, getAuthUserId(req));
  }
}
