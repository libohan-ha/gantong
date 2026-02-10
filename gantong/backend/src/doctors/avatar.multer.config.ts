import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import type { AuthRequest } from '../auth/auth-user';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const avatarMulterConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, _file, cb) => {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id ?? authReq.user?.sub ?? 'unknown';
      const uploadPath = path.join('uploads', 'avatars', String(userId));
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeBase = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      cb(null, `${Date.now()}_${safeBase}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
      cb(new BadRequestException('仅支持 JPG/PNG/WEBP 图片格式'), false);
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: MAX_AVATAR_SIZE,
    files: 1,
  },
};
