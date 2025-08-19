import { 
  Controller, 
  Get, 
  Patch, 
  Body, 
  Req, 
  UseGuards,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { DoctorProfile } from '../users/doctor-profile.entity'
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto'
import { DoctorStatsDto } from './dto/doctor-stats.dto'

@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorProfileRepository: Repository<DoctorProfile>
  ) {}

  /**
   * 获取我的医生资料
   */
  @Get('me/profile')
  async getMyProfile(@Req() req: any): Promise<DoctorProfile> {
    const userId = req.user.id || req.user.sub

    try {
      // 查找现有资料
      let profile = await this.doctorProfileRepository.findOne({ 
        where: { userId } 
      })
      
      // 如果不存在，创建默认资料
      if (!profile) {
        await this.doctorProfileRepository.query(
          'INSERT INTO doctor_profiles ("userId", "name", "hospital", "verified") VALUES ($1, $2, $3, $4)',
          [userId, '', '', false]
        )
        profile = await this.doctorProfileRepository.findOne({
          where: { userId }
        })
      }

      return profile!
    } catch (error) {
      console.error('获取医生资料失败:', error)
      throw new HttpException(
        '获取医生资料失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  /**
   * 更新我的医生资料
   */
  @Patch('me/profile')
  async updateMyProfile(
    @Req() req: any,
    @Body() updateDto: UpdateDoctorProfileDto
  ): Promise<DoctorProfile> {
    const userId = req.user.id || req.user.sub
    
    try {
      // 查找现有资料
      let profile = await this.doctorProfileRepository.findOne({ 
        where: { userId } 
      })
      
      // 如果不存在，创建新资料
      if (!profile) {
        await this.doctorProfileRepository.query(
          'INSERT INTO doctor_profiles ("userId", "name", "hospital", "verified") VALUES ($1, $2, $3, $4)',
          [userId, '', '', false]
        )
        profile = await this.doctorProfileRepository.findOne({
          where: { userId }
        })
      }

      // 确保profile不为null
      if (!profile) {
        throw new HttpException(
          '创建医生资料失败',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }

      // 更新字段
      if (updateDto.name !== undefined) profile.name = updateDto.name
      if (updateDto.age !== undefined) profile.age = updateDto.age
      if (updateDto.title !== undefined) profile.title = updateDto.title
      if (updateDto.phone !== undefined) profile.phone = updateDto.phone
      if (updateDto.hospital !== undefined) profile.hospital = updateDto.hospital

      // 保存更新
      const savedProfile = await this.doctorProfileRepository.save(profile)

      return savedProfile
    } catch (error) {
      if (error.code === '23505') {
        // 唯一约束冲突
        throw new HttpException(
          '手机号已被其他医生使用',
          HttpStatus.CONFLICT
        )
      }
      
      throw new HttpException(
        '更新医生资料失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  /**
   * 获取我的统计信息
   */
  @Get('me/stats')
  async getMyStats(@Req() req: any): Promise<DoctorStatsDto> {
    const userId = req.user.id || req.user.sub
    
    try {
      // 获取医生资料
      const profile = await this.doctorProfileRepository.findOne({ 
        where: { userId } 
      })
      
      // 计算资料完整度
      const profileCompleteness = this.calculateProfileCompleteness(profile)
      
      // TODO: 这里可以添加视频相关的统计查询
      // 目前返回默认值，后续可以从视频表中查询真实数据
      
      return new DoctorStatsDto({
        videoCount: 0,
        totalViews: 0,
        totalLikes: 0,
        profileCompleteness
      })
    } catch (error) {
      throw new HttpException(
        '获取统计信息失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  /**
   * 计算资料完整度
   */
  private calculateProfileCompleteness(profile: DoctorProfile | null): number {
    if (!profile) return 0
    
    const fields = ['name', 'age', 'title', 'phone', 'hospital']
    const filledFields = fields.filter(field => {
      const value = profile[field as keyof DoctorProfile]
      return value !== null && value !== undefined && value !== ''
    })
    
    return Math.round((filledFields.length / fields.length) * 100)
  }
}
