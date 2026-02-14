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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { QueryCasesDto } from './dto/query-cases.dto';
import { casesMulterConfig } from './multer.config';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { getAuthUserId, type AuthRequest } from '../auth/auth-user';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

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

  @Get('cases/mine')
  @Roles(Role.DOCTOR)
  async findMine(@Req() req: AuthRequest, @Query() query: QueryCasesDto) {
    return this.casesService.findMine(
      getAuthUserId(req),
      query.page,
      query.pageSize,
    );
  }

  @Patch('cases/:id')
  @Roles(Role.DOCTOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCaseDto,
    @Req() req: AuthRequest,
  ) {
    return this.casesService.updateCase(id, getAuthUserId(req), dto);
  }

  @Post('cases/:id/files')
  @Roles(Role.DOCTOR)
  @UseInterceptors(FilesInterceptor('files', 10, casesMulterConfig))
  async addFiles(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: AuthRequest,
  ) {
    return this.casesService.addFilesToCase(id, getAuthUserId(req), files);
  }

  @Delete('cases/:id/files/:fileId')
  @Roles(Role.DOCTOR)
  async removeFile(
    @Param('id', ParseIntPipe) id: number,
    @Param('fileId', ParseIntPipe) fileId: number,
    @Req() req: AuthRequest,
  ) {
    return this.casesService.removeFileFromCase(id, fileId, getAuthUserId(req));
  }

  @Delete('cases/:id')
  @Roles(Role.DOCTOR)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.casesService.deleteCase(id, getAuthUserId(req));
  }
}
