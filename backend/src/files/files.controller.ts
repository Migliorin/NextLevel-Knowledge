import { BadRequestException, Controller, Get, Header, Param, Post, Res, StreamableFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse, ApiBody as SwaggerApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuards } from '../auth/jwt-auth.guard.js';
import { CurrentUserDto } from '../dto/Auth/currentUser.dto.js';
import { ListFilesResponseDto } from '../dto/Upload/listFilesResponse.dto.js';
import { UploadResponseDto } from '../dto/Upload/uploadResponse.dto.js';
import { FilesService } from './files.service.js';

@ApiTags('Files')
@ApiBearerAuth('jwt')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post("")
    @UseGuards(JwtAuthGuards)
    @UseInterceptors(
        FilesInterceptor('files', 5, {
            storage: memoryStorage(),
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
                    description: 'Lista de arquivos PDF',
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
    uploadFiles(@UploadedFiles() uploadedFiles: Express.Multer.File[], @CurrentUser() user: CurrentUserDto) {
        return this.filesService.uploadFiles(uploadedFiles, user.userId);
    }

    @Get("")
    @UseGuards(JwtAuthGuards)
    @ApiOperation({ summary: 'Listar arquivos salvos' })
    @ApiCreatedResponse({
        description: 'Arquivos salvos com sucesso',
        type: ListFilesResponseDto
    })
    @ApiUnauthorizedResponse({
        description: 'Token JWT ausente ou invalido',
    })
    findMany(
        @CurrentUser() user: CurrentUserDto,
    ) {
        return this.filesService.findMany(user.userId);
    }

    @Get(":id")
    @UseGuards(JwtAuthGuards)
    @ApiOperation({ summary: 'Obter arquivo para visualização' })
    @Header('Content-Type', 'application/pdf')
    @ApiParam({
        name: 'id',
        description: 'ID do arquivo',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Arquivo retornado com sucesso',
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
    async streamFile(
        @CurrentUser() user: CurrentUserDto,
        @Param("id") id: string,
        @Res({ passthrough: true }) response: Response,
    ) {
        const file = await this.filesService.streamFile(id, user.userId);
        response.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
        return new StreamableFile(file.stream);
    }
}

