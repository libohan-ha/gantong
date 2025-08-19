import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { Video, VideoStatus } from './video.entity'
import { User } from '../users/user.entity'
import { DoctorProfile } from '../users/doctor-profile.entity'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { VideoQueryDto } from './dto/video-query.dto'
import * as path from 'path'
import * as fs from 'fs'

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videosRepo: Repository<Video>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(DoctorProfile)
    private doctorProfilesRepo: Repository<DoctorProfile>
  ) {}

  async createVideo(
    userId: number,
    createVideoDto: CreateVideoDto,
    file: Express.Multer.File
  ): Promise<Video> {
    // 获取医生资料作为作者快照
    const doctorProfile = await this.doctorProfilesRepo.findOne({
      where: { userId }
    })

    if (!doctorProfile) {
      throw new BadRequestException('医生资料不存在，请先完善个人资料')
    }

    // 构建视频URL（开发环境使用静态文件服务）
    const videoUrl = `/static/videos/${file.filename}`

    const video = this.videosRepo.create({
      ...createVideoDto,
      authorUserId: userId,
      fileName: file.originalname,
      fileSizeBytes: file.size,
      storagePath: file.path,
      videoUrl,
      status: VideoStatus.PUBLISHED, // 自动发布
      authorSnapshotName: doctorProfile.name || '医生',
      authorSnapshotHospital: doctorProfile.hospital || '医院',
      authorSnapshotTitle: doctorProfile.title || '医师'
    })

    return this.videosRepo.save(video)
  }

  async findMyVideos(userId: number, query: VideoQueryDto) {
    const page = parseInt(query.page || '1')
    const pageSize = Math.min(parseInt(query.pageSize || '20'), 100)
    const skip = (page - 1) * pageSize

    const queryBuilder = this.videosRepo
      .createQueryBuilder('video')
      .where('video.authorUserId = :userId', { userId })

    this.applyFilters(queryBuilder, query)
    this.applyOrdering(queryBuilder, query.orderBy || 'createdAt')

    const [videos, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount()

    return {
      data: videos,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  async findPublicVideos(query: VideoQueryDto) {
    const page = parseInt(query.page || '1')
    const pageSize = Math.min(parseInt(query.pageSize || '20'), 100)
    const skip = (page - 1) * pageSize

    const queryBuilder = this.videosRepo
      .createQueryBuilder('video')
      .where('video.status = :status', { status: VideoStatus.PUBLISHED })

    this.applyFilters(queryBuilder, query)
    this.applyOrdering(queryBuilder, query.orderBy || 'createdAt')

    const [videos, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount()

    return {
      data: videos,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  async findOne(id: number, userId?: number): Promise<Video> {
    const video = await this.videosRepo.findOne({ where: { id } })
    
    if (!video) {
      throw new NotFoundException('视频不存在')
    }

    // 如果不是公开状态，只有作者可以查看
    if (video.status !== VideoStatus.PUBLISHED && video.authorUserId !== userId) {
      throw new ForbiddenException('无权访问此视频')
    }

    return video
  }

  async updateVideo(id: number, userId: number, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const video = await this.findOne(id, userId)
    
    if (video.authorUserId !== userId) {
      throw new ForbiddenException('只能修改自己的视频')
    }

    Object.assign(video, updateVideoDto)
    return this.videosRepo.save(video)
  }

  async deleteVideo(id: number, userId: number): Promise<void> {
    const video = await this.findOne(id, userId)
    
    if (video.authorUserId !== userId) {
      throw new ForbiddenException('只能删除自己的视频')
    }

    // 删除文件
    try {
      if (fs.existsSync(video.storagePath)) {
        fs.unlinkSync(video.storagePath)
      }
    } catch (error) {
      console.warn('删除视频文件失败:', error)
    }

    await this.videosRepo.remove(video)
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.videosRepo.increment({ id }, 'viewCount', 1)
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<Video>, query: VideoQueryDto) {
    if (query.status) {
      queryBuilder.andWhere('video.status = :status', { status: query.status })
    }

    if (query.category) {
      queryBuilder.andWhere('video.category = :category', { category: query.category })
    }

    if (query.difficulty) {
      queryBuilder.andWhere('video.difficulty = :difficulty', { difficulty: query.difficulty })
    }

    if (query.q) {
      queryBuilder.andWhere(
        '(video.title ILIKE :search OR video.description ILIKE :search OR video.authorSnapshotName ILIKE :search)',
        { search: `%${query.q}%` }
      )
    }
  }

  private applyOrdering(queryBuilder: SelectQueryBuilder<Video>, orderBy: string) {
    switch (orderBy) {
      case 'viewCount':
        queryBuilder.orderBy('video.viewCount', 'DESC')
        break
      case 'likeCount':
        queryBuilder.orderBy('video.likeCount', 'DESC')
        break
      case 'createdAt':
      default:
        queryBuilder.orderBy('video.createdAt', 'DESC')
        break
    }
  }
}
