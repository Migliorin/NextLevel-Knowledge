import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { FeatureController } from './feature/feature.controller.js';
import { FeatureModule } from './feature/feature.module.js';
import { UploadModule } from './upload/upload.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MinioModule } from './minio/minio.module.js';

@Module({
  imports: [
      AuthModule,
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      FeatureModule,
      UploadModule,
      PrismaModule,
      MinioModule
    ],
  controllers: [FeatureController],
})
export class AppModule {}
