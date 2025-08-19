import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import { VideosService } from './videos.service'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { VideoQueryDto } from './dto/video-query.dto'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../users/user.entity'
import { multerConfig } from './multer.config'
import * as fs from 'fs'
import * as path from 'path'

@Controller()
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // 医生上传视频
  @Post('videos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async create(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    if (!file) {
      throw new BadRequestException('请选择视频文件')
    }

    // 处理 FormData 中的数组字段
    const createVideoDto: CreateVideoDto = {
      title: body.title,
      description: body.description,
      category: body.category,
      difficulty: body.difficulty,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : []),
      targetAudience: Array.isArray(body.targetAudience) ? body.targetAudience : (body.targetAudience ? [body.targetAudience] : [])
    }

    return this.videosService.createVideo(req.user.id, createVideoDto, file)
  }

  // 医生查看自己的视频列表
  @Get('videos/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async findMine(@Query() query: VideoQueryDto, @Req() req: any) {
    return this.videosService.findMyVideos(req.user.id, query)
  }

  // 家长查看专家课程列表
  @Get('client/expert-courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  async findPublicVideos(@Query() query: VideoQueryDto) {
    return this.videosService.findPublicVideos(query)
  }

  // 家长查看专家课程详情
  @Get('client/expert-courses/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  async findPublicVideo(@Param('id') id: string) {
    const video = await this.videosService.findOne(+id)
    // 增加观看次数
    await this.videosService.incrementViewCount(+id)
    return video
  }

  // 医生查看自己的视频详情
  @Get('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.videosService.findOne(+id, req.user.id)
  }

  // 医生更新视频信息
  @Patch('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async update(
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @Req() req: any
  ) {
    return this.videosService.updateVideo(+id, req.user.id, updateVideoDto)
  }

  // 医生删除视频
  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.videosService.deleteVideo(+id, req.user.id)
    return { message: '视频删除成功' }
  }

  // 视频流式播放（支持断点续传）
  @Get('client/expert-courses/:id/stream')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARENT)
  async streamVideo(
    @Param('id') id: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const video = await this.videosService.findOne(+id)
    
    if (!fs.existsSync(video.storagePath)) {
      throw new BadRequestException('视频文件不存在')
    }

    const stat = fs.statSync(video.storagePath)
    const fileSize = stat.size
    const range = req.headers.range

    if (range) {
      // 支持断点续传
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunksize = (end - start) + 1
      const file = fs.createReadStream(video.storagePath, { start, end })
      
      res.status(206)
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
      })
      
      return new StreamableFile(file)
    } else {
      // 完整文件
      const file = fs.createReadStream(video.storagePath)
      res.set({
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
      })
      
      return new StreamableFile(file)
    }
  }
}
