import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Client } from 'minio';
import { UploadResponseDto } from '../dto/Upload/uploadResponse.dto.js';
import { MINIO_CLIENT } from '../minio/minio.constants.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

export const FILE_STATUS = {
    PENDING: 0,
    EXTRACTING: 1,
    EXTRACTED: 2,
    ERROR: 3,
} as const;

const FILE_STATUS_RECORDS = [
    { id: FILE_STATUS.PENDING, name: 'PENDING' },
    { id: FILE_STATUS.EXTRACTING, name: 'EXTRACTING' },
    { id: FILE_STATUS.EXTRACTED, name: 'EXTRACTED' },
    { id: FILE_STATUS.ERROR, name: 'ERROR' },
];

const DEFAULT_FILES_PAGE = 1;
const DEFAULT_FILES_LIMIT = 9;
const MAX_FILES_LIMIT = 50;

type FindManyFilesOptions = {
    limit?: string;
    page?: string;
    paginated?: boolean;
    search?: string;
};

@Injectable()
export class FilesService implements OnModuleInit {

    constructor(
        @Inject(MINIO_CLIENT) private readonly minioClient: Client,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) {}

    async onModuleInit() {
        await this.ensureFileStatuses();
    }

    async uploadFiles(files: Express.Multer.File[], userId: string, description?: string){
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

            const normalizedDescription = description?.trim() || null;

            await this.ensureFileStatuses();
    
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
                            description: normalizedDescription,
                            userId: parsedUserId,
                            statusId: FILE_STATUS.PENDING
                        },
                    });
                    createdFileIds.push(createdFile.id);
    
                    results.push({
                        bucket: bucketName,
                        objectName,
                        originalName: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype,
                        id: createdFile.id,
                        description: createdFile.description,
                        status: createdFile.statusId,
                        statusId: createdFile.statusId,
                        createdAt: createdFile.createdAt,
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

    async findMany(userId:string, options: FindManyFilesOptions = {}){
        if (!userId) {
            throw new BadRequestException('Usuario nao identificado.');
        }

        const parsedUserId = Number(userId);

        if (Number.isNaN(parsedUserId)) {
            throw new BadRequestException('Usuario invalido para buscar os arquivos.');
        }

        const normalizedSearch = options.search?.trim();
        const where = {
            userId: parsedUserId,
            ...(normalizedSearch
                ? {
                    OR: [
                        {
                            name: {
                                contains: normalizedSearch,
                                mode: 'insensitive' as const,
                            },
                        },
                        {
                            description: {
                                contains: normalizedSearch,
                                mode: 'insensitive' as const,
                            },
                        },
                    ],
                }
                : {}),
        };

        const files = await this.prisma.files.findMany({
            where,
            select:{
                id: true,
                name: true,
                path: true,
                description: true,
                statusId: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const serializedFiles = await Promise.all(files.map((file) => this.serializeFile(file)));

        if (!options.paginated) {
            return serializedFiles;
        }

        const page = this.parsePaginationNumber(options.page, DEFAULT_FILES_PAGE);
        const limit = Math.min(
            this.parsePaginationNumber(options.limit, DEFAULT_FILES_LIMIT),
            MAX_FILES_LIMIT,
        );
        const total = serializedFiles.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const normalizedPage = Math.min(page, totalPages);
        const start = (normalizedPage - 1) * limit;
        const items = serializedFiles.slice(start, start + limit);

        return {
            items,
            pagination: {
                hasNextPage: normalizedPage < totalPages,
                hasPreviousPage: normalizedPage > 1,
                limit,
                page: normalizedPage,
                total,
                totalPages,
            },
            statusCounts: this.getStatusCounts(serializedFiles),
        };
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
                description: true,
                statusId: true,
                createdAt: true,
            },
        });

        if (!file) {
            throw new NotFoundException('Arquivo nao encontrado.');
        }
        
        return this.serializeFile(file);
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
        await this.ensureFileStatuses();

        const file = await this.findOne(fileId, userId);

        const updatedFile = await this.prisma.files.update({
            where: {
                id: file.id,
            },
            data: {
                statusId: status,
            },
            select: {
                id: true,
                name: true,
                path: true,
                description: true,
                statusId: true,
                createdAt: true,
            },
        });

        await this.redisService.setExtractionStatus(
            this.extractDocumentProtocolId(updatedFile.path),
            updatedFile.statusId,
            {
                fileId: updatedFile.id,
                fileName: updatedFile.name,
            },
        );

        return {
            id: updatedFile.id,
            name: updatedFile.name,
            path: updatedFile.path,
            description: updatedFile.description,
            status: updatedFile.statusId,
            statusId: updatedFile.statusId,
            createdAt: updatedFile.createdAt,
        };
    }

    async deleteFile(fileId: string, userId: string) {
        const file = await this.findOne(fileId, userId);
        const bucketName = this.configService.getOrThrow('MINIO_BUCKET');
        const documentProtocolId = this.extractDocumentProtocolId(file.path);

        await this.minioClient.removeObject(bucketName, file.path);

        await this.prisma.files.delete({
            where: {
                id: file.id,
            },
        });

        await this.redisService.deleteExtractionStatus(documentProtocolId);

        return {
            id: file.id,
            name: file.name,
            deleted: true,
        };
    }

    private async serializeFile(file: {
        id: number;
        name: string;
        path: string;
        description: string | null;
        statusId: number;
        createdAt: Date;
    }) {
        const statusId = await this.resolveEffectiveStatus(file);

        return {
            id: file.id,
            name: file.name,
            path: file.path,
            description: file.description,
            status: statusId,
            statusId,
            createdAt: file.createdAt,
        };
    }

    private async resolveEffectiveStatus(file: {
        id: number;
        path: string;
        statusId: number;
    }) {
        const redisStatus = await this.redisService.getExtractionStatus(
            this.extractDocumentProtocolId(file.path),
        );
        const statusId = this.parseFileStatus(redisStatus) ?? file.statusId;

        if (statusId !== file.statusId) {
            await this.prisma.files.update({
                where: {
                    id: file.id,
                },
                data: {
                    statusId,
                },
            });
        }

        return statusId;
    }

    private parseFileStatus(value: string | null) {
        if (!value) {
            return null;
        }

        const normalizedValue = value.trim();
        const numericValue = Number(normalizedValue);

        if (!Number.isNaN(numericValue) && this.isKnownStatus(numericValue)) {
            return numericValue;
        }

        try {
            const parsedValue = JSON.parse(normalizedValue) as {
                status?: unknown;
                statusId?: unknown;
                status_id?: unknown;
                state?: unknown;
            };
            const nestedValue =
                parsedValue.statusId ??
                parsedValue.status_id ??
                parsedValue.status ??
                parsedValue.state;

            if (typeof nestedValue === 'number' && this.isKnownStatus(nestedValue)) {
                return nestedValue;
            }

            if (typeof nestedValue === 'string') {
                return this.parseFileStatus(nestedValue);
            }
        } catch {
            // Redis pode armazenar apenas uma string simples de status.
        }

        const statusByName: Record<string, number> = {
            ERROR: FILE_STATUS.ERROR,
            EXTRACTED: FILE_STATUS.EXTRACTED,
            EXTRACTING: FILE_STATUS.EXTRACTING,
            PENDING: FILE_STATUS.PENDING,
        };

        return statusByName[normalizedValue.toUpperCase()] ?? null;
    }

    private isKnownStatus(status: number) {
        return Object.values(FILE_STATUS).includes(
            status as (typeof FILE_STATUS)[keyof typeof FILE_STATUS],
        );
    }

    private parsePaginationNumber(value: string | undefined, fallback: number) {
        const parsedValue = Number(value);

        if (!Number.isInteger(parsedValue) || parsedValue < 1) {
            return fallback;
        }

        return parsedValue;
    }

    private getStatusCounts(files: Array<{ statusId: number }>) {
        return files.reduce(
            (counts, file) => {
                if (file.statusId === FILE_STATUS.PENDING) {
                    counts.queued += 1;
                }

                if (file.statusId === FILE_STATUS.EXTRACTING) {
                    counts.processing += 1;
                }

                if (file.statusId === FILE_STATUS.EXTRACTED) {
                    counts.finished += 1;
                }

                if (file.statusId === FILE_STATUS.ERROR) {
                    counts.error += 1;
                }

                return counts;
            },
            {
                error: 0,
                finished: 0,
                processing: 0,
                queued: 0,
            },
        );
    }

    private buildObjectName(userId: string) {
        return `${userId}/${randomUUID()}.pdf`;
    }

    private extractDocumentProtocolId(path: string) {
        const fileName = path.split('/').at(-1);

        if (!fileName) {
            throw new BadRequestException('Caminho do arquivo invalido.');
        }

        return fileName.replace(/\.pdf$/i, '');
    }

    private async ensureBucketExists(bucketName: string) {
        const bucketExists = await this.minioClient.bucketExists(bucketName);

        if (!bucketExists) {
            await this.minioClient.makeBucket(bucketName);
        }
    }

    private async ensureFileStatuses() {
        await Promise.all(
            FILE_STATUS_RECORDS.map((status) =>
                this.prisma.status.upsert({
                    where: {
                        id: status.id,
                    },
                    update: {
                        name: status.name,
                    },
                    create: status,
                }),
            ),
        );
    }
}
