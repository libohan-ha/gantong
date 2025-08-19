import { Controller, Get, Query, Param } from '@nestjs/common'
import { TrainingsService } from './trainings.service'
import { QueryTrainingsDto } from './dto/query-trainings.dto'

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
    )
  }

  // 家长端：培训详情（公开）
  @Get('trainings/:id')
  async getTraining(@Param('id') id: string) {
    return this.trainingsService.findPublicTrainingById(+id)
  }

  // 家长端：有培训的医生列表（聚合）
  @Get('doctors')
  async listDoctors(@Query() query: QueryTrainingsDto) {
    return this.trainingsService.listDoctorsWithUpcomingTrainings(
      query.page ?? 1,
      query.pageSize ?? 10,
      query.q,
    )
  }
}

