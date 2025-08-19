import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Child } from './entities/child.entity'
import { GrowthProfile } from './entities/growth-profile.entity'
import { HealthRecord } from './entities/health-record.entity'
import { CreateChildDto, UpdateChildDto } from './dto/child.dto'
import { UpsertGrowthProfileDto } from './dto/profile.dto'
import { CreateHealthRecordDto, UpdateHealthRecordDto } from './dto/health-record.dto'

@Injectable()
export class GrowthService {
  constructor(
    @InjectRepository(Child) private childRepo: Repository<Child>,
    @InjectRepository(GrowthProfile) private profileRepo: Repository<GrowthProfile>,
    @InjectRepository(HealthRecord) private healthRepo: Repository<HealthRecord>,
  ) {}

  private async ensureChildOwnership(userId: number, childId: number): Promise<Child> {
    const child = await this.childRepo.findOne({ where: { id: childId } })
    if (!child) throw new NotFoundException('孩子不存在')
    if (child.parentUserId !== userId) throw new ForbiddenException('无权访问该孩子')
    return child
  }

  // children
  async listChildren(userId: number) {
    const items = await this.childRepo.find({ where: { parentUserId: userId } })
    return { items }
  }

  async createChild(userId: number, dto: CreateChildDto) {
    const child = this.childRepo.create({ ...dto, parentUserId: userId })
    const saved = await this.childRepo.save(child)
    // 初始化空 profile
    const profile = this.profileRepo.create({ childId: saved.id, behaviorStrengths: [], behaviorChallenges: [], behaviorImprovements: [] })
    await this.profileRepo.save(profile)
    return saved
  }

  async getChild(userId: number, childId: number) {
    const child = await this.ensureChildOwnership(userId, childId)
    return child
  }

  async updateChild(userId: number, childId: number, dto: UpdateChildDto) {
    const child = await this.ensureChildOwnership(userId, childId)
    Object.assign(child, dto)
    return this.childRepo.save(child)
  }

  async deleteChild(userId: number, childId: number) {
    const child = await this.ensureChildOwnership(userId, childId)
    await this.childRepo.remove(child)
    return { success: true }
  }

  // profile
  async getProfile(userId: number, childId: number) {
    const child = await this.ensureChildOwnership(userId, childId)
    let profile = await this.profileRepo.findOne({ where: { childId } })
    if (!profile) {
      profile = await this.profileRepo.save(
        this.profileRepo.create({ childId, behaviorStrengths: [], behaviorChallenges: [], behaviorImprovements: [] }),
      )
    }
    return {
      child: {
        id: child.id,
        name: child.name,
        gender: child.gender,
        birthDate: child.birthDate,
        avatarUrl: child.avatarUrl,
      },
      currentStatus: {
        physicalDevelopment: {
          height: profile.heightCm ?? null,
          weight: profile.weightKg ?? null,
          lastUpdated: profile.lastPhysicalUpdated ?? null,
        },
        behaviorObservation: {
          strengths: profile.behaviorStrengths || [],
          challenges: profile.behaviorChallenges || [],
          improvements: profile.behaviorImprovements || [],
        },
        dailySkills: {
          selfCare: profile.dailySelfCare ?? 0,
          communication: profile.dailyCommunication ?? 0,
          social: profile.dailySocial ?? 0,
          motor: profile.dailyMotor ?? 0,
        },
      },
    }
  }

  async upsertProfile(userId: number, childId: number, dto: UpsertGrowthProfileDto) {
    await this.ensureChildOwnership(userId, childId)
    const existing = await this.profileRepo.findOne({ where: { childId } })
    const merged = this.profileRepo.create({
      ...(existing || { childId, behaviorStrengths: [], behaviorChallenges: [], behaviorImprovements: [] }),
      ...dto,
    })
    const saved = await this.profileRepo.save(merged)
    return this.getProfile(userId, childId)
  }

  // health records
  async listHealthRecords(userId: number, childId: number, page = 1, pageSize = 20) {
    await this.ensureChildOwnership(userId, childId)
    const [items, total] = await this.healthRepo.findAndCount({
      where: { childId },
      order: { date: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
    return { items, total, page, pageSize }
  }

  async createHealthRecord(userId: number, childId: number, dto: CreateHealthRecordDto) {
    await this.ensureChildOwnership(userId, childId)
    const rec = this.healthRepo.create({ childId, ...dto })
    return this.healthRepo.save(rec)
  }

  async updateHealthRecord(userId: number, recordId: number, dto: UpdateHealthRecordDto) {
    const rec = await this.healthRepo.findOne({ where: { id: recordId } })
    if (!rec) throw new NotFoundException('记录不存在')
    await this.ensureChildOwnership(userId, rec.childId)
    Object.assign(rec, dto)
    return this.healthRepo.save(rec)
  }

  async deleteHealthRecord(userId: number, recordId: number) {
    const rec = await this.healthRepo.findOne({ where: { id: recordId } })
    if (!rec) throw new NotFoundException('记录不存在')
    await this.ensureChildOwnership(userId, rec.childId)
    await this.healthRepo.remove(rec)
    return { success: true }
  }
}

