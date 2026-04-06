import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { MINIO_CLIENT } from './minio.constants.js';

@Module({
  providers: [
    {
      provide: MINIO_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const port = Number(configService.getOrThrow('MINIO_PORT'));
        const useSSL =
          configService.get<string>('MINIO_USE_SSL', 'false') === 'true';

        return new Client({
          endPoint: configService.getOrThrow('MINIO_ENDPOINT'),
          port,
          useSSL,
          accessKey: configService.getOrThrow('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow('MINIO_SECRET_KEY'),
        });
      },
    },
  ],
  exports: [MINIO_CLIENT],
})
export class MinioModule {}
