import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Req,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { casesMulterConfig } from './multer.config';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { QueryCasesDto } from './dto/query-cases.dto';
import { getAuthUserId, type AuthRequest } from '../auth/auth-user';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  // 医生上传病例（标题必填，文件至少1个）
  @Post('cases')
  @Roles(Role.DOCTOR)
  @UseInterceptors(FilesInterceptor('files', 10, casesMulterConfig))
  async create(
    @Body() dto: CreateCaseDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: AuthRequest,
  ) {
    return this.casesService.createCase(getAuthUserId(req), dto, files);
  }

  // 医生查看自己的病例列表
  @Get('cases/mine')
  @Roles(Role.DOCTOR)
  async findMine(@Req() req: AuthRequest, @Query() query: QueryCasesDto) {
    return this.casesService.findMine(
      getAuthUserId(req),
      query.page,
      query.pageSize,
    );
  }

  // 编辑病例（仅限本人）
  @Patch('cases/:id')
  @Roles(Role.DOCTOR)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCaseDto,
    @Req() req: AuthRequest,
  ) {
    return this.casesService.updateCase(+id, getAuthUserId(req), dto);
  }

  // 删除病例（仅限本人）
  @Delete('cases/:id')
  @Roles(Role.DOCTOR)
  async remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.casesService.deleteCase(+id, getAuthUserId(req));
  }
}
