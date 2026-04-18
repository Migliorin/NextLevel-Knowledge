import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesService } from '../files/files.service.js';
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

    
}
