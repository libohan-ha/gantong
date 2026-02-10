import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import type { AuthRequest } from '../auth/auth-user';

const MAX_VIDEO = 200 * 1024 * 1024; // 200MB

export const casesMulterConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, _file, cb) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id ?? authReq.user?.sub ?? 'unknown';
      const uploadPath = path.join(
        'uploads',
        'cases',
        String(year),
        month,
        String(userId),
      );
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const safeBase = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      cb(null, `${timestamp}_${safeBase}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
    if (!allowed.includes(file.mimetype)) {
      cb(new BadRequestException('只支持 JPG/PNG/PDF/MP4 格式'), false);
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: MAX_VIDEO,
    files: 10,
  },
};
