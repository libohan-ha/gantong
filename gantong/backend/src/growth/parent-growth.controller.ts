import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { GrowthService } from './growth.service';
import { CreateChildDto, UpdateChildDto } from './dto/child.dto';
import { UpsertGrowthProfileDto } from './dto/profile.dto';
import {
  CreateHealthRecordDto,
  UpdateHealthRecordDto,
} from './dto/health-record.dto';
import { getAuthUserId, type AuthRequest } from '../auth/auth-user';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
@Controller('parent/growth')
export class ParentGrowthController {
  constructor(private readonly growthService: GrowthService) {}

  // Children
  @Get('children')
  async listChildren(@Req() req: AuthRequest) {
    return this.growthService.listChildren(getAuthUserId(req));
  }

  @Post('children')
  async createChild(@Req() req: AuthRequest, @Body() dto: CreateChildDto) {
    return this.growthService.createChild(getAuthUserId(req), dto);
  }

  @Get('children/:childId')
  async getChild(
    @Req() req: AuthRequest,
    @Param('childId', ParseIntPipe) childId: number,
  ) {
    return this.growthService.getChild(getAuthUserId(req), childId);
  }

  @Put('children/:childId')
  async updateChild(
    @Req() req: AuthRequest,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() dto: UpdateChildDto,
  ) {
    return this.growthService.updateChild(getAuthUserId(req), childId, dto);
  }

  @Delete('children/:childId')
  async deleteChild(
    @Req() req: AuthRequest,
    @Param('childId', ParseIntPipe) childId: number,
  ) {
    return this.growthService.deleteChild(getAuthUserId(req), childId);
  }

  // Profile
  @Get('children/:childId/profile')
  async getProfile(
    @Req() req: AuthRequest,
    @Param('childId', ParseIntPipe) childId: number,
  ) {
    return this.growthService.getProfile(getAuthUserId(req), childId);
  }

  @Put('children/:childId/profile')
  async upsertProfile(
    @Req() req: AuthRequest,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() dto: UpsertGrowthProfileDto,
  ) {
    return this.growthService.upsertProfile(getAuthUserId(req), childId, dto);
  }

  // Health Records
  @Get('children/:childId/health-records')
  async listHealthRecords(
    @Req() req: AuthRequest,
    @Param('childId', ParseIntPipe) childId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.growthService.listHealthRecords(
      getAuthUserId(req),
      childId,
      Number(page),
      Number(pageSize),
    );
  }

  @Post('children/:childId/health-records')
  async createHealthRecord(
    @Req() req: AuthRequest,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() dto: CreateHealthRecordDto,
  ) {
    return this.growthService.createHealthRecord(
      getAuthUserId(req),
      childId,
      dto,
    );
  }

  @Put('health-records/:recordId')
  async updateHealthRecord(
    @Req() req: AuthRequest,
    @Param('recordId', ParseIntPipe) recordId: number,
    @Body() dto: UpdateHealthRecordDto,
  ) {
    return this.growthService.updateHealthRecord(
      getAuthUserId(req),
      recordId,
      dto,
    );
  }

  @Delete('health-records/:recordId')
  async deleteHealthRecord(
    @Req() req: AuthRequest,
    @Param('recordId', ParseIntPipe) recordId: number,
  ) {
    return this.growthService.deleteHealthRecord(getAuthUserId(req), recordId);
  }
}
