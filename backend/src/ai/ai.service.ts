import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FILE_STATUS, FilesService } from '../files/files.service.js';
import { WebsocketService } from '../websocket/websocket.service.js';

@Injectable()
export class AiService {
    constructor(
        private readonly configService: ConfigService, 
        private readonly filesService: FilesService,
        private readonly websocketService: WebsocketService
    ){}


    async askDocument(fileId: string, userId: string, query: string) {
        const normalizedQuery = query?.trim();

        if (!normalizedQuery) {
            throw new BadRequestException('Pergunta obrigatoria.');
        }

        const file = await this.filesService.findOne(fileId, userId);
        const aiUrl = this.configService.getOrThrow('AI_DOCUMENT_SEARCH_WS_URL');
        const documentProtocolId = this.websocketService.extractDocumentProtocolId(file.path);

        return this.websocketService.sendProtocolWebsocketAI(
            aiUrl, 
            `${documentProtocolId}:${normalizedQuery}`
        );
    }

    async extractDocument(fileId: string, userId: string) {
        const file = await this.filesService.findOne(fileId, userId);
        const aiUrl =
            this.configService.get<string>('AI_DOCUMENT_EXTRACT_WS_URL') ??
            this.configService.getOrThrow('AI_DOCUMENT_SEARCH_WS_URL');
        const documentProtocolId = this.websocketService.extractDocumentProtocolId(file.path);

        await this.filesService.updateExtractionStatus(
            fileId,
            userId,
            FILE_STATUS.EXTRACTING,
        );

        try {
            const result = await this.websocketService.sendProtocolWebsocketAI(
                aiUrl,
                documentProtocolId,
                120000,
                'Nao foi possivel iniciar a extracao do documento na IA',
                'Resposta invalida recebida da IA ao extrair o documento',
            );
            const updatedFile = await this.filesService.updateExtractionStatus(
                fileId,
                userId,
                FILE_STATUS.EXTRACTED,
            );

            return {
                document_id: updatedFile.id,
                status: updatedFile.status,
                result,
            };
        } catch (error) {
            await this.filesService.updateExtractionStatus(
                fileId,
                userId,
                FILE_STATUS.ERROR,
            );

            throw error;
        }
    }

    
}
