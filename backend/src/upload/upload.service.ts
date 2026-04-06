import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { Client } from 'minio';
import { MINIO_CLIENT } from '../minio/minio.constants.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UploadService {
    constructor(
        @Inject(MINIO_CLIENT) private readonly minioClient: Client,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    async upload(file: Express.Multer.File, userId: string){
        if (!file) {
            throw new BadRequestException('Arquivo nao enviado.');
        }

        if (!userId) {
            throw new BadRequestException('Usuario nao identificado.');
        }

        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException('O arquivo precisa ser um PDF valido.');
        }

        const parsedUserId = Number(userId);

        if (Number.isNaN(parsedUserId)) {
            throw new BadRequestException('Usuario invalido para vincular o arquivo.');
        }

        const bucketName = this.configService.getOrThrow('MINIO_BUCKET');
        const objectName = this.buildObjectName(userId);

        await this.ensureBucketExists(bucketName);
        await this.minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
            'Content-Type': file.mimetype,
        });

        try {
            await this.prisma.files.create({
                data: {
                    name: file.originalname,
                    path: objectName,
                    userId: parsedUserId,
                },
            });
        } catch (error) {
            await this.minioClient.removeObject(bucketName, objectName);
            throw error;
        }

        return {
            bucket: bucketName,
            objectName,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
        };
    }

    async update(){

    }

    private buildObjectName(userId: string) {
        return `${userId}/${randomUUID()}.pdf`;
    }

    private async ensureBucketExists(bucketName: string) {
        const bucketExists = await this.minioClient.bucketExists(bucketName);

        if (!bucketExists) {
            await this.minioClient.makeBucket(bucketName);
        }
    }
}
