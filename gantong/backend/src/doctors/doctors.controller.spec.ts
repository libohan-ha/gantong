import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DoctorsController } from './doctors.controller';
import { DoctorProfile } from '../users/doctor-profile.entity';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { Role, User } from '../users/user.entity';

describe('DoctorsController', () => {
  let controller: DoctorsController;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockUserReq = {
    user: {
      id: 1,
      role: Role.DOCTOR,
    },
  };

  const mockUserEntity: User = Object.assign(new User(), {
    id: 1,
    role: Role.DOCTOR,
    enabled: true,
    createdAt: new Date(),
  });

  const mockProfile: DoctorProfile = {
    userId: 1,
    name: '张医生',
    hospital: '北京儿童医院',
    title: '主任医师',
    age: 45,
    phone: '13800138000',
    avatarUrl: '/static/avatars/1/a.png',
    verified: false,
    user: mockUserEntity,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorsController],
      providers: [
        {
          provide: getRepositoryToken(DoctorProfile),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<DoctorsController>(DoctorsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('returns existing profile', async () => {
      mockRepository.findOne.mockResolvedValue(mockProfile);

      const result = await controller.getMyProfile(mockUserReq);

      expect(result).toEqual(mockProfile);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('creates profile when not found', async () => {
      const createdProfile = {
        ...mockProfile,
        name: '',
        hospital: '',
        verified: false,
      };
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValue(createdProfile);
      mockRepository.save.mockResolvedValue(createdProfile);

      const result = await controller.getMyProfile(mockUserReq);

      expect(result).toEqual(createdProfile);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('throws internal server error on unknown exception', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('db error'));

      await expect(controller.getMyProfile(mockUserReq)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('updateMyProfile', () => {
    const updateDto: UpdateDoctorProfileDto = {
      name: '李医生',
      hospital: '上海儿童医院',
    };

    it('updates existing profile', async () => {
      const updatedProfile = { ...mockProfile, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockProfile);
      mockRepository.save.mockResolvedValue(updatedProfile);

      const result = await controller.updateMyProfile(mockUserReq, updateDto);

      expect(result).toEqual(updatedProfile);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('throws conflict exception on duplicate phone', async () => {
      mockRepository.findOne.mockResolvedValue(mockProfile);
      mockRepository.save.mockRejectedValue({ code: '23505' });

      await expect(
        controller.updateMyProfile(mockUserReq, { phone: '13800138000' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('uploadMyAvatar', () => {
    it('updates avatar url and returns it', async () => {
      const profile = { ...mockProfile, avatarUrl: undefined };
      mockRepository.findOne.mockResolvedValue(profile);
      mockRepository.save.mockImplementation((p: DoctorProfile) =>
        Promise.resolve(p),
      );

      const file = {
        path: 'uploads\\avatars\\1\\avatar.png',
        filename: 'avatar.png',
      } as Express.Multer.File;

      const result = await controller.uploadMyAvatar(mockUserReq, file);

      expect(result).toEqual({ avatarUrl: '/static/avatars/1/avatar.png' });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('throws when file is missing', async () => {
      await expect(
        controller.uploadMyAvatar(
          mockUserReq,
          undefined as unknown as Express.Multer.File,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getMyStats', () => {
    it('returns doctor stats with profile completeness', async () => {
      mockRepository.findOne.mockResolvedValue(mockProfile);

      const result = await controller.getMyStats(mockUserReq);

      expect(result).toHaveProperty('videoCount');
      expect(result).toHaveProperty('totalViews');
      expect(result).toHaveProperty('totalLikes');
      expect(result).toHaveProperty('profileCompleteness');
      expect(result.profileCompleteness).toBe(100);
    });

    it('returns 0 completeness if no profile', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await controller.getMyStats(mockUserReq);

      expect(result.profileCompleteness).toBe(0);
    });
  });

  describe('calculateProfileCompleteness', () => {
    it('returns 100 for complete profile', () => {
      const result = controller['calculateProfileCompleteness'](mockProfile);
      expect(result).toBe(100);
    });

    it('returns expected value for partial profile', () => {
      const partialProfile: DoctorProfile = {
        ...mockProfile,
        name: '',
        age: undefined,
      };
      const result = controller['calculateProfileCompleteness'](partialProfile);
      expect(result).toBe(60);
    });
  });
});
