import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HttpException, HttpStatus } from '@nestjs/common'

import { DoctorsController } from './doctors.controller'
import { DoctorProfile } from '../users/doctor-profile.entity'
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto'

describe('DoctorsController', () => {
  let controller: DoctorsController
  let repository: Repository<DoctorProfile>

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    query: jest.fn(),
  }

  const mockUser = {
    id: 1,
    role: 'DOCTOR'
  }

  const mockProfile: DoctorProfile = {
    userId: 1,
    name: '张医生',
    hospital: '北京儿童医院',
    title: '主任医师',
    age: 45,
    phone: '13800138000',
    verified: false,
    user: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorsController],
      providers: [
        {
          provide: getRepositoryToken(DoctorProfile),
          useValue: mockRepository,
        },
      ],
    }).compile()

    controller = module.get<DoctorsController>(DoctorsController)
    repository = module.get<Repository<DoctorProfile>>(getRepositoryToken(DoctorProfile))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getMyProfile', () => {
    it('应该返回现有的医生资料', async () => {
      mockRepository.findOne.mockResolvedValue(mockProfile)

      const result = await controller.getMyProfile({ user: mockUser })

      expect(result).toEqual(mockProfile)
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUser.id }
      })
    })

    it('应该创建新的医生资料如果不存在', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(null) // 第一次查询返回null
        .mockResolvedValueOnce(mockProfile) // 第二次查询返回创建的资料
      mockRepository.query.mockResolvedValue(undefined)

      const result = await controller.getMyProfile({ user: mockUser })

      expect(result).toEqual(mockProfile)
      expect(mockRepository.query).toHaveBeenCalled()
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2)
    })
  })

  describe('updateMyProfile', () => {
    const updateDto: UpdateDoctorProfileDto = {
      name: '李医生',
      hospital: '上海儿童医院'
    }

    it('应该更新现有的医生资料', async () => {
      const updatedProfile = { ...mockProfile, ...updateDto }
      mockRepository.findOne.mockResolvedValue(mockProfile)
      mockRepository.save.mockResolvedValue(updatedProfile)

      const result = await controller.updateMyProfile({ user: mockUser }, updateDto)

      expect(result).toEqual(updatedProfile)
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('应该创建新资料如果不存在', async () => {
      const updatedProfile = { ...mockProfile, ...updateDto }
      mockRepository.findOne
        .mockResolvedValueOnce(null) // 第一次查询返回null
        .mockResolvedValueOnce(updatedProfile) // 第二次查询返回创建的资料
      mockRepository.query.mockResolvedValue(undefined)
      mockRepository.save.mockResolvedValue(updatedProfile)

      const result = await controller.updateMyProfile({ user: mockUser }, updateDto)

      expect(result).toEqual(updatedProfile)
      expect(mockRepository.query).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalled()
    })
  })

  describe('getMyStats', () => {
    it('应该返回医生统计信息', async () => {
      mockRepository.findOne.mockResolvedValue(mockProfile)

      const result = await controller.getMyStats({ user: mockUser })

      expect(result).toHaveProperty('videoCount')
      expect(result).toHaveProperty('totalViews')
      expect(result).toHaveProperty('totalLikes')
      expect(result).toHaveProperty('profileCompleteness')
      expect(result.profileCompleteness).toBe(100)
    })

    it('应该计算正确的资料完整度', async () => {
      const incompleteProfile = { ...mockProfile, name: '', age: null }
      mockRepository.findOne.mockResolvedValue(incompleteProfile)

      const result = await controller.getMyStats({ user: mockUser })

      expect(result.profileCompleteness).toBeLessThan(100)
    })
  })

  describe('calculateProfileCompleteness', () => {
    it('应该为空资料返回0', () => {
      const result = controller['calculateProfileCompleteness'](null)
      expect(result).toBe(0)
    })

    it('应该为完整资料返回100', () => {
      const result = controller['calculateProfileCompleteness'](mockProfile)
      expect(result).toBe(100)
    })

    it('应该为部分完整资料返回正确百分比', () => {
      const partialProfile = { ...mockProfile, name: '', age: null }
      const result = controller['calculateProfileCompleteness'](partialProfile)
      expect(result).toBe(60) // 3 out of 5 fields filled
    })
  })
})
