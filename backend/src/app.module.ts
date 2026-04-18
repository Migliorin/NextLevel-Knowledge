import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module.js';
import { AuthModule } from './auth/auth.module.js';
import { FilesModule } from './files/files.module.js';
import { MinioModule } from './minio/minio.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { WebsocketModule } from './websocket/websocket.module.js';

@Module({
  imports: [
      AuthModule,
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      PrismaModule,
      MinioModule,
      FilesModule,
      AiModule,
      WebsocketModule
    ],
  controllers: [],
})
export class AppModule {}
