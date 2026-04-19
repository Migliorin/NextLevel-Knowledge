import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Client } from 'minio';
import { UploadResponseDto } from '../dto/Upload/uploadResponse.dto.js';
import { MINIO_CLIENT } from '../minio/minio.constants.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const FILE_STATUS = {
    PENDING: 0,
    EXTRACTING: 1,
    EXTRACTED: 2,
    ERROR: 3,
} as const;

@Injectable()
export class FilesService {

    constructor(
        @Inject(MINIO_CLIENT) private readonly minioClient: Client,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    async uploadFiles(files: Express.Multer.File[], userId: string){
        if (!files?.length) {
                throw new BadRequestException('Nenhum arquivo foi enviado.');
            }
    
            if (!userId) {
                throw new BadRequestException('Usuario nao identificado.');
            }
    
            const parsedUserId = Number(userId);
    
            if (Number.isNaN(parsedUserId)) {
                throw new BadRequestException('Usuario invalido para vincular o arquivo.');
            }
    
            const bucketName = this.configService.getOrThrow('MINIO_BUCKET');
            await this.ensureBucketExists(bucketName);
            const uploadedObjects: string[] = [];
            const createdFileIds: number[] = [];
    
            try {
                const results: UploadResponseDto[] = [];
    
                for (const file of files) {
                    if (file.mimetype !== 'application/pdf') {
                        throw new BadRequestException(
                            `O arquivo ${file.originalname} precisa ser um PDF valido.`,
                        );
                    }
    
                    const objectName = this.buildObjectName(userId);
    
                    await this.minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
                        'Content-Type': file.mimetype,
                    });
                    uploadedObjects.push(objectName);
    
                    const createdFile = await this.prisma.files.create({
                        data: {
                            name: file.originalname,
                            path: objectName,
                            userId: parsedUserId,
                        },
                    });
                    createdFileIds.push(createdFile.id);
    
                    results.push({
                        bucket: bucketName,
                        objectName,
                        originalName: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype,
                    });
                }
    
                return results;
            } catch (error) {
                if (createdFileIds.length) {
                    await this.prisma.files.deleteMany({
                        where: {
                            id: {
                                in: createdFileIds,
                            },
                        },
                    });
                }
    
                await Promise.all(
                    uploadedObjects.map((objectName) =>
                        this.minioClient.removeObject(bucketName, objectName).catch(() => undefined),
                    ),
                );
    
                throw error;
            }
    }

    async findMany(userId:string){
        if (!userId) {
            throw new BadRequestException('Usuario nao identificado.');
        }

        const parsedUserId = Number(userId);

        if (Number.isNaN(parsedUserId)) {
            throw new BadRequestException('Usuario invalido para buscar os arquivos.');
        }

        return await this.prisma.files.findMany({
            where: {
                userId: parsedUserId,
            },
            select:{
                id: true,
                name: true,
                status: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(fileId:string, userId:string){
        if (!userId) {
            throw new BadRequestException('Usuario nao identificado.');
        }

        const parsedUserId = Number(userId);
        const parsedFileId = Number(fileId);

        if (Number.isNaN(parsedUserId)) {
            throw new BadRequestException('Usuario invalido para buscar o arquivo.');
        }

        if (Number.isNaN(parsedFileId)) {
            throw new BadRequestException('Arquivo invalido.');
        }

        const file = await this.prisma.files.findFirst({
            where: {
                id: parsedFileId,
                userId: parsedUserId,
            },
            select: {
                id: true,
                name: true,
                path: true,
                status: true,
                createdAt: true,
            },
        });

        if (!file) {
            throw new NotFoundException('Arquivo nao encontrado.');
        }
        
        return file;
    }


    async streamFile(fileId:string, userId:string){
        
        const file = await this.findOne(fileId,userId);
        const bucketName = this.configService.getOrThrow('MINIO_BUCKET');
        const stream = await this.minioClient.getObject(bucketName, file.path);

        return {
            name: file.name,
            stream,
        };
    }

    async updateExtractionStatus(fileId: string, userId: string, status: number) {
        const file = await this.findOne(fileId, userId);

        return this.prisma.files.update({
            where: {
                id: file.id,
            },
            data: {
                status,
            },
            select: {
                id: true,
                name: true,
                status: true,
                createdAt: true,
            },
        });
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
