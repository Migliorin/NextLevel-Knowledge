import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller.js';
import { UploadService } from './upload.service.js';
import { MinioModule } from '../minio/minio.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [MinioModule, PrismaModule],
  controllers: [UploadController],
  providers: [UploadService]
})
export class UploadModule {}
