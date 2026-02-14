import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseRecord } from './entities/case-record.entity';
import { CaseFile } from './entities/case-file.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import * as fs from 'fs/promises';

const hasCjk = (value: string) => /[\u4e00-\u9fff]/.test(value);

const normalizeUploadedOriginalName = (value: string) => {
  if (!value) return value;
  const decoded = Buffer.from(value, 'latin1').toString('utf8');
  if (!decoded || decoded.includes('�')) return value;
  if (!hasCjk(value) && hasCjk(decoded)) return decoded;
  return value;
};

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(CaseRecord) private caseRepo: Repository<CaseRecord>,
    @InjectRepository(CaseFile) private fileRepo: Repository<CaseFile>,
  ) {}

  async createCase(
    doctorUserId: number,
    dto: CreateCaseDto,
    uploadedFiles: Express.Multer.File[],
  ) {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new ForbiddenException('至少上传一个文件');
    }

    const caseRecord = this.caseRepo.create({
      doctorUserId,
      title: dto.title,
      description: dto.description ?? null,
      caseType: dto.caseType ?? 'online',
    });
    const saved = await this.caseRepo.save(caseRecord);

    const fileEntities = uploadedFiles.map((f) =>
      this.fileRepo.create({
        caseId: saved.id,
        originalName: normalizeUploadedOriginalName(f.originalname),
        mimeType: f.mimetype,
        size: f.size,
        storagePath: f.path,
      }),
    );

    await this.fileRepo.save(fileEntities);

    const withFiles = await this.caseRepo.findOne({
      where: { id: saved.id },
      relations: ['files'],
    });
    return withFiles!;
  }

  async findMine(doctorUserId: number, page = 1, pageSize = 10) {
    const [items, total] = await this.caseRepo.findAndCount({
      where: { doctorUserId },
      order: { createdAt: 'DESC' },
      relations: ['files'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async findOneForDoctor(id: number, doctorUserId: number) {
    const record = await this.caseRepo.findOne({
      where: { id },
      relations: ['files'],
    });
    if (!record) {
      throw new NotFoundException('病例不存在');
    }
    if (record.doctorUserId !== doctorUserId) {
      throw new ForbiddenException('无权访问该病例');
    }
    return record;
  }

  async updateCase(id: number, doctorUserId: number, dto: UpdateCaseDto) {
    const record = await this.findOneForDoctor(id, doctorUserId);
    if (dto.title !== undefined) record.title = dto.title;
    if (dto.description !== undefined) record.description = dto.description;
    if (dto.caseType !== undefined) record.caseType = dto.caseType;
    await this.caseRepo.save(record);
    return this.caseRepo.findOne({
      where: { id: record.id },
      relations: ['files'],
    });
  }

  async addFilesToCase(
    id: number,
    doctorUserId: number,
    uploadedFiles: Express.Multer.File[],
  ) {
    const record = await this.findOneForDoctor(id, doctorUserId);
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return this.caseRepo.findOne({
        where: { id: record.id },
        relations: ['files'],
      });
    }

    const fileEntities = uploadedFiles.map((f) =>
      this.fileRepo.create({
        caseId: record.id,
        originalName: normalizeUploadedOriginalName(f.originalname),
        mimeType: f.mimetype,
        size: f.size,
        storagePath: f.path,
      }),
    );
    await this.fileRepo.save(fileEntities);

    return this.caseRepo.findOne({
      where: { id: record.id },
      relations: ['files'],
    });
  }

  async removeFileFromCase(id: number, fileId: number, doctorUserId: number) {
    const record = await this.findOneForDoctor(id, doctorUserId);
    const file = await this.fileRepo.findOne({
      where: { id: fileId, caseId: record.id },
    });
    if (!file) {
      throw new NotFoundException('附件不存在');
    }

    try {
      await fs.unlink(file.storagePath);
    } catch {
      // Ignore missing file on disk.
    }
    await this.fileRepo.remove(file);

    return this.caseRepo.findOne({
      where: { id: record.id },
      relations: ['files'],
    });
  }

  async deleteCase(id: number, doctorUserId: number) {
    const record = await this.findOneForDoctor(id, doctorUserId);
    const files = await this.fileRepo.find({ where: { caseId: record.id } });

    await Promise.all(
      files.map(async (f) => {
        try {
          await fs.unlink(f.storagePath);
        } catch {
          return undefined;
        }
      }),
    );

    await this.caseRepo.remove(record);
    return { success: true };
  }
}
