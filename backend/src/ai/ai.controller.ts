import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse, ApiBody as SwaggerApiBody } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuards } from '../auth/jwt-auth.guard.js';
import { CurrentUserDto } from '../dto/Auth/currentUser.dto.js';
import { DocumentQuestionDto } from '../dto/Upload/documentQuestion.dto.js';
import { DocumentSearchResponseDto } from '../dto/Upload/documentSearchResponse.dto.js';
import { AiService } from './ai.service.js';


@ApiTags('AI')
@Controller('ai')
@ApiBearerAuth('jwt')
export class AiController {
    constructor(private readonly uploadService: AiService) {
    
        }
        @Post(':id/ask')
        @UseGuards(JwtAuthGuards)
        @ApiOperation({ summary: 'Enviar pergunta para a IA sobre um documento' })
        @ApiParam({
            name: 'id',
            description: 'ID do arquivo',
            example: 1,
        })
        @SwaggerApiBody({
            type: DocumentQuestionDto,
            description: 'Pergunta do usuario sobre o documento',
        })
        @ApiOkResponse({
            description: 'Resposta da IA retornada com sucesso',
            type: DocumentSearchResponseDto,
        })
        @ApiUnauthorizedResponse({
            description: 'Token JWT ausente ou invalido',
        })
        searchDocument(
            @Param('id') id: string,
            @Body() body: DocumentQuestionDto,
            @CurrentUser() user: CurrentUserDto,
        ) {
            return this.uploadService.askDocument(id, user.userId, body.query);
        }
}
