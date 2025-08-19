import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { BadRequestException } from '@nestjs/common'
import { diskStorage } from 'multer'
import * as path from 'path'
import * as fs from 'fs'

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // 按年月和用户ID组织目录结构
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const userId = (req as any).user?.id || 'unknown'
      
      const uploadPath = path.join('uploads', 'videos', String(year), month, String(userId))
      
      // 确保目录存在
      fs.mkdirSync(uploadPath, { recursive: true })
      
      cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
      // 生成唯一文件名：时间戳_原文件名
      const timestamp = Date.now()
      const ext = path.extname(file.originalname)
      const basename = path.basename(file.originalname, ext)
      const filename = `${timestamp}_${basename}${ext}`
      
      cb(null, filename)
    }
  }),
  fileFilter: (req, file, cb) => {
    // 只允许视频文件
    if (!file.mimetype.startsWith('video/')) {
      cb(new BadRequestException('只能上传视频文件'), false)
      return
    }
    
    // 允许的视频格式
    const allowedMimeTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo', // AVI
      'video/x-ms-wmv'   // WMV
    ]
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new BadRequestException('不支持的视频格式，请上传 MP4、MOV、AVI 或 WMV 格式'), false)
      return
    }
    
    cb(null, true)
  },
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  }
}
