import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody as SwaggerApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiTags
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuards } from '../auth/jwt-auth.guard.js';
import { CurrentUserDto } from '../dto/Auth/currentUser.dto.js';
import { UploadResponseDto } from '../dto/Upload/uploadResponse.dto.js';
import { UploadService } from './upload.service.js';
import { memoryStorage } from 'multer';

@ApiTags('Upload')
@ApiBearerAuth('jwt')
@Controller('documents')
export class UploadController {
    constructor(private readonly uploadService: UploadService){

    }

    @Post("/upload")
    @UseGuards(JwtAuthGuards)
    @ApiOperation({ summary: 'Enviar um arquivo PDF para o MinIO' })
    @ApiConsumes('multipart/form-data')
    @SwaggerApiBody({
        description: 'Arquivo PDF enviado no campo file',
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo PDF com tamanho maximo de 10 MB',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Arquivo enviado com sucesso para o MinIO',
        type: UploadResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Arquivo ausente, invalido ou diferente de PDF',
    })
    @ApiUnauthorizedResponse({
        description: 'Token JWT ausente ou invalido',
    })
    @UseInterceptors(
        FileInterceptor('file', {
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
    upload(@UploadedFile() file:  Express.Multer.File, @CurrentUser() user: CurrentUserDto){
        return this.uploadService.upload(file, user.userId);
    }

}
