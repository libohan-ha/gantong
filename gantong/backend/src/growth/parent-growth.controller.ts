import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { GrowthService } from './growth.service'
import { CreateChildDto, UpdateChildDto } from './dto/child.dto'
import { UpsertGrowthProfileDto } from './dto/profile.dto'
import { CreateHealthRecordDto, UpdateHealthRecordDto } from './dto/health-record.dto'

@UseGuards(JwtAuthGuard)
@Controller('parent/growth')
export class ParentGrowthController {
  constructor(private readonly growthService: GrowthService) {}

  // Children
  @Get('children')
  async listChildren(@Req() req: any) {
    return this.growthService.listChildren(req.user?.id || req.user?.sub)
  }

  @Post('children')
  async createChild(@Req() req: any, @Body() dto: CreateChildDto) {
    return this.growthService.createChild(req.user?.id || req.user?.sub, dto)
  }

  @Get('children/:childId')
  async getChild(@Req() req: any, @Param('childId', ParseIntPipe) childId: number) {
    return this.growthService.getChild(req.user?.id || req.user?.sub, childId)
  }

  @Put('children/:childId')
  async updateChild(@Req() req: any, @Param('childId', ParseIntPipe) childId: number, @Body() dto: UpdateChildDto) {
    return this.growthService.updateChild(req.user?.id || req.user?.sub, childId, dto)
  }

  @Delete('children/:childId')
  async deleteChild(@Req() req: any, @Param('childId', ParseIntPipe) childId: number) {
    return this.growthService.deleteChild(req.user?.id || req.user?.sub, childId)
  }

  // Profile
  @Get('children/:childId/profile')
  async getProfile(@Req() req: any, @Param('childId', ParseIntPipe) childId: number) {
    return this.growthService.getProfile(req.user?.id || req.user?.sub, childId)
  }

  @Put('children/:childId/profile')
  async upsertProfile(@Req() req: any, @Param('childId', ParseIntPipe) childId: number, @Body() dto: UpsertGrowthProfileDto) {
    return this.growthService.upsertProfile(req.user?.id || req.user?.sub, childId, dto)
  }

  // Health Records
  @Get('children/:childId/health-records')
  async listHealthRecords(
    @Req() req: any,
    @Param('childId', ParseIntPipe) childId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.growthService.listHealthRecords(req.user?.id || req.user?.sub, childId, Number(page), Number(pageSize))
  }

  @Post('children/:childId/health-records')
  async createHealthRecord(@Req() req: any, @Param('childId', ParseIntPipe) childId: number, @Body() dto: CreateHealthRecordDto) {
    return this.growthService.createHealthRecord(req.user?.id || req.user?.sub, childId, dto)
  }

  @Put('health-records/:recordId')
  async updateHealthRecord(@Req() req: any, @Param('recordId', ParseIntPipe) recordId: number, @Body() dto: UpdateHealthRecordDto) {
    return this.growthService.updateHealthRecord(req.user?.id || req.user?.sub, recordId, dto)
  }

  @Delete('health-records/:recordId')
  async deleteHealthRecord(@Req() req: any, @Param('recordId', ParseIntPipe) recordId: number) {
    return this.growthService.deleteHealthRecord(req.user?.id || req.user?.sub, recordId)
  }
}

