import {
    BadGatewayException,
    BadRequestException,
    GatewayTimeoutException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { Client } from 'minio';
import { MINIO_CLIENT } from '../minio/minio.constants.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadResponseDto } from '../dto/Upload/uploadResponse.dto.js';

@Injectable()
export class UploadService {
    constructor(
        @Inject(MINIO_CLIENT) private readonly minioClient: Client,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    async upload(files: Express.Multer.File[], userId: string){
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

    async listUserFiles(userId: string) {
        if (!userId) {
            throw new BadRequestException('Usuario nao identificado.');
        }

        const parsedUserId = Number(userId);

        if (Number.isNaN(parsedUserId)) {
            throw new BadRequestException('Usuario invalido para buscar os arquivos.');
        }

        return this.prisma.files.findMany({
            where: {
                userId: parsedUserId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getUserFile(fileId: string, userId: string) {
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
                name: true,
                path: true,
            },
        });

        if (!file) {
            throw new NotFoundException('Arquivo nao encontrado.');
        }

        const bucketName = this.configService.getOrThrow('MINIO_BUCKET');
        const stream = await this.minioClient.getObject(bucketName, file.path);

        return {
            name: file.name,
            stream,
        };
    }

    async askDocument(fileId: string, userId: string, query: string) {
        const normalizedQuery = query?.trim();

        if (!normalizedQuery) {
            throw new BadRequestException('Pergunta obrigatoria.');
        }

        const file = await this.findUserFile(fileId, userId);
        const aiUrl = this.configService.getOrThrow('AI_DOCUMENT_SEARCH_WS_URL');
        const documentProtocolId = this.extractDocumentProtocolId(file.path);

        return this.searchDocumentWithAi(aiUrl, `${documentProtocolId}:${normalizedQuery}`);
    }

    private async findUserFile(fileId: string, userId: string) {
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
            },
        });

        if (!file) {
            throw new NotFoundException('Arquivo nao encontrado.');
        }

        return file;
    }

    private extractDocumentProtocolId(path: string) {
        const fileName = path.split('/').at(-1);

        if (!fileName) {
            throw new BadRequestException('Caminho do arquivo invalido.');
        }

        return fileName.replace(/\.pdf$/i, '');
    }

    private searchDocumentWithAi(url: string, payload: string) {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(url);
            const timeout = setTimeout(() => {
                socket.close();
                reject(new GatewayTimeoutException('Tempo limite excedido ao consultar a IA.'));
            }, 60000);

            socket.addEventListener('open', () => {
                socket.send(payload);
            });

            socket.addEventListener('message', (event) => {
                clearTimeout(timeout);
                socket.close();

                try {
                    const data = typeof event.data === 'string' ? event.data : String(event.data);
                    resolve(JSON.parse(data));
                } catch {
                    reject(new BadGatewayException('Resposta invalida recebida da IA.'));
                }
            });

            socket.addEventListener('error', () => {
                clearTimeout(timeout);
                reject(new BadGatewayException('Nao foi possivel comunicar com a IA.'));
            });
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
