import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/static/',
  });

  // 启用CORS
  app.enableCors({
    origin: true, // dev 下允许任意来源
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
