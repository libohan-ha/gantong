import { Controller, Post, Get, Body, UseGuards, Req, Query, Param, Patch, Delete } from '@nestjs/common'
import { TrainingsService } from './trainings.service'
import { CreateTrainingDto } from './dto/create-training.dto'
import { UpdateTrainingDto } from './dto/update-training.dto'
import { QueryTrainingsDto } from './dto/query-trainings.dto'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../users/user.entity'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  // 医生创建培训
  @Post('trainings')
  @Roles(Role.DOCTOR)
  async create(
    @Body() dto: CreateTrainingDto,
    @Req() req: any,
  ) {
    return this.trainingsService.createTraining(req.user.id, dto)
  }

  // 医生查看自己的培训列表
  @Get('trainings/mine')
  @Roles(Role.DOCTOR)
  async findMine(@Req() req: any, @Query() query: QueryTrainingsDto) {
    return this.trainingsService.findMine(req.user.id, query.page, query.pageSize)
  }

  // 查看单个培训详情（仅限本人）
  @Get('trainings/:id')
  @Roles(Role.DOCTOR)
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.trainingsService.findOneForDoctor(+id, req.user.id)
  }

  // 编辑培训（仅限本人）
  @Patch('trainings/:id')
  @Roles(Role.DOCTOR)
  async update(@Param('id') id: string, @Body() dto: UpdateTrainingDto, @Req() req: any) {
    return this.trainingsService.updateTraining(+id, req.user.id, dto)
  }

  // 删除培训（仅限本人）
  @Delete('trainings/:id')
  @Roles(Role.DOCTOR)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.trainingsService.deleteTraining(+id, req.user.id)
  }
}
