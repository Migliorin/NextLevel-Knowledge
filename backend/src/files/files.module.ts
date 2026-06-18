import { Module } from '@nestjs/common';
import { MinioModule } from '../minio/minio.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { FilesController } from './files.controller.js';
import { FilesService } from './files.service.js';


@Module({
  imports: [MinioModule, PrismaModule, RedisModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}
