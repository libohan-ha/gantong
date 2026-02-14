import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { TrainingsService } from './trainings.service';
import { QueryTrainingsDto } from './dto/query-trainings.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
@Controller('parent/experts')
export class ParentExpertsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  // 家长端：培训列表（默认仅展示未来的培训）
  @Get('trainings')
  async listTrainings(@Query() query: QueryTrainingsDto) {
    return this.trainingsService.findPublicTrainings(
      query.page ?? 1,
      query.pageSize ?? 10,
      query.q,
      query.type,
    );
  }

  // 家长端：培训详情（公开）
  @Get('trainings/:id')
  async getTraining(@Param('id') id: string) {
    return this.trainingsService.findPublicTrainingById(+id);
  }
}
