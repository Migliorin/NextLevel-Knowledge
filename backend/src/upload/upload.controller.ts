import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Header,
    Param,
    Post,
    Res,
    StreamableFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import type { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody as SwaggerApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOperation,
    ApiOkResponse,
    ApiParam,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiTags
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuards } from '../auth/jwt-auth.guard.js';
import { CurrentUserDto } from '../dto/Auth/currentUser.dto.js';
import { UploadResponseDto } from '../dto/Upload/uploadResponse.dto.js';
import { ListFilesResponseDto } from '../dto/Upload/listFilesResponse.dto.js';
import { DocumentQuestionDto } from '../dto/Upload/documentQuestion.dto.js';
import { DocumentSearchResponseDto } from '../dto/Upload/documentSearchResponse.dto.js';
import { UploadService } from './upload.service.js';
import { memoryStorage } from 'multer';

@ApiTags('Upload')
@ApiBearerAuth('jwt')
@Controller('documents')
export class UploadController {
    constructor(private readonly uploadService: UploadService){

    }

    @Get()
    @UseGuards(JwtAuthGuards)
    @ApiOperation({ summary: 'Listar arquivos PDF do usuario autenticado' })
    @ApiOkResponse({
        description: 'Arquivos do usuario autenticado retornados com sucesso',
        type: ListFilesResponseDto,
        isArray: true,
    })
    @ApiUnauthorizedResponse({
        description: 'Token JWT ausente ou invalido',
    })
    list(@CurrentUser() user: CurrentUserDto) {
        return this.uploadService.listUserFiles(user.userId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuards)
    @Header('Content-Type', 'application/pdf')
    @ApiOperation({ summary: 'Visualizar PDF do usuario autenticado pelo ID' })
    @ApiParam({
        name: 'id',
        description: 'ID do arquivo',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Arquivo PDF retornado com sucesso',
        content: {
            'application/pdf': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Token JWT ausente ou invalido',
    })
    async getDocument(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const file = await this.uploadService.getUserFile(id, user.userId);
        response.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
        return new StreamableFile(file.stream);
    }

    @Post(':id/search')
    @UseGuards(JwtAuthGuards)
    @ApiOperation({ summary: 'Enviar pergunta para a IA sobre um documento do usuario autenticado' })
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

    @Post("/upload")
    @UseGuards(JwtAuthGuards)
    @ApiOperation({ summary: 'Enviar arquivos PDF para o MinIO' })
    @ApiConsumes('multipart/form-data')
    @SwaggerApiBody({
        description: 'Arquivos PDF enviados no campo files',
        schema: {
            type: 'object',
            required: ['files'],
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Lista de arquivos PDF com tamanho maximo de 10 MB por arquivo',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Arquivos enviados com sucesso para o MinIO',
        type: UploadResponseDto,
        isArray: true,
    })
    @ApiBadRequestResponse({
        description: 'Arquivo ausente, invalido ou diferente de PDF',
    })
    @ApiUnauthorizedResponse({
        description: 'Token JWT ausente ou invalido',
    })
    @UseInterceptors(
        FilesInterceptor('files', 10, {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_request, file, callback) => {
            if (file.mimetype !== 'application/pdf') {
                return callback(
                    new BadRequestException('Apenas arquivos PDF sao permitidos.'),
                    false,
                );
            }

            callback(null, true);
        },
        }),
    )
    upload(
        @UploadedFiles()
        uploadedFiles: Express.Multer.File[],
        @CurrentUser() user: CurrentUserDto,
    ){
        return this.uploadService.upload(uploadedFiles, user.userId);
    }

}
