import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DoctorProfile } from '../users/doctor-profile.entity';
import { Role } from '../users/user.entity';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { DoctorStatsDto } from './dto/doctor-stats.dto';
import { avatarMulterConfig } from './avatar.multer.config';
import { getAuthUserId, type AuthRequest } from '../auth/auth-user';

type DbErrorWithCode = { code?: string };
const isDbErrorWithCode = (error: unknown): error is DbErrorWithCode =>
  typeof error === 'object' && error !== null && 'code' in error;

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR, Role.SUPER_ADMIN)
export class DoctorsController {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorProfileRepository: Repository<DoctorProfile>,
  ) {}

  @Get('me/profile')
  async getMyProfile(@Req() req: AuthRequest): Promise<DoctorProfile> {
    const userId = getAuthUserId(req);

    try {
      return await this.findOrCreateProfile(userId);
    } catch {
      throw new InternalServerErrorException('获取医生资料失败');
    }
  }

  @Patch('me/profile')
  async updateMyProfile(
    @Req() req: AuthRequest,
    @Body() updateDto: UpdateDoctorProfileDto,
  ): Promise<DoctorProfile> {
    const userId = getAuthUserId(req);

    try {
      const profile = await this.findOrCreateProfile(userId);

      if (updateDto.name !== undefined) profile.name = updateDto.name;
      if (updateDto.age !== undefined) profile.age = updateDto.age;
      if (updateDto.title !== undefined) profile.title = updateDto.title;
      if (updateDto.phone !== undefined) profile.phone = updateDto.phone;
      if (updateDto.hospital !== undefined)
        profile.hospital = updateDto.hospital;

      return await this.doctorProfileRepository.save(profile);
    } catch (error) {
      if (isDbErrorWithCode(error) && error.code === '23505') {
        throw new ConflictException('手机号已被其他医生使用');
      }
      throw new InternalServerErrorException('更新医生资料失败');
    }
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarMulterConfig))
  async uploadMyAvatar(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    if (!file) {
      throw new BadRequestException('请选择头像文件');
    }

    const userId = getAuthUserId(req);

    try {
      const profile = await this.findOrCreateProfile(userId);
      const avatarUrl = this.buildAvatarStaticUrl(file, userId);

      profile.avatarUrl = avatarUrl;
      await this.doctorProfileRepository.save(profile);

      return { avatarUrl };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('上传头像失败');
    }
  }

  @Get('me/stats')
  async getMyStats(@Req() req: AuthRequest): Promise<DoctorStatsDto> {
    const userId = getAuthUserId(req);

    try {
      const profile = await this.doctorProfileRepository.findOne({
        where: { userId },
      });
      const profileCompleteness = this.calculateProfileCompleteness(profile);

      return new DoctorStatsDto({
        videoCount: 0,
        totalViews: 0,
        totalLikes: 0,
        profileCompleteness,
      });
    } catch {
      throw new InternalServerErrorException('获取统计信息失败');
    }
  }

  private async findOrCreateProfile(userId: number): Promise<DoctorProfile> {
    const existing = await this.doctorProfileRepository.findOne({
      where: { userId },
    });
    if (existing) return existing;

    try {
      return await this.doctorProfileRepository.save(
        this.doctorProfileRepository.create({
          userId,
          name: '',
          hospital: '',
          verified: false,
        }),
      );
    } catch (error) {
      if (isDbErrorWithCode(error) && error.code === '23505') {
        const profile = await this.doctorProfileRepository.findOne({
          where: { userId },
        });
        if (profile) return profile;
      }
      throw error;
    }
  }

  private buildAvatarStaticUrl(
    file: Express.Multer.File,
    userId: number,
  ): string {
    const uploadsRoot = path.resolve('uploads');
    const absoluteFilePath = path.resolve(file.path);
    const relativePath = path
      .relative(uploadsRoot, absoluteFilePath)
      .replace(/\\/g, '/');

    if (!relativePath || relativePath.startsWith('..')) {
      return `/static/avatars/${userId}/${file.filename}`;
    }

    return `/static/${relativePath}`;
  }

  private calculateProfileCompleteness(profile: DoctorProfile | null): number {
    if (!profile) return 0;

    const fields: Array<keyof DoctorProfile> = [
      'name',
      'age',
      'title',
      'phone',
      'hospital',
    ];
    const filledFields = fields.filter((field) => {
      const value = profile[field];
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((filledFields.length / fields.length) * 100);
  }
}
