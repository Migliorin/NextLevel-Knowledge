import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    example: 'documents',
    description: 'Nome do bucket onde o arquivo foi salvo',
  })
  bucket: string;

  @ApiProperty({
    example:
      'c6f7c1d2-9f14-4fd2-8c7b-1d3d7d2f9abc/7c0f2ec4-2e87-4c1f-bb08-3d0cf3f7e5d1.pdf',
    description: 'Chave do objeto no MinIO',
  })
  objectName: string;

  @ApiProperty({
    example: 'meu-arquivo.pdf',
    description: 'Nome original do arquivo enviado',
  })
  originalName: string;

  @ApiProperty({
    example: 245760,
    description: 'Tamanho do arquivo em bytes',
  })
  size: number;

  @ApiProperty({
    example: 'application/pdf',
    description: 'Tipo MIME do arquivo enviado',
  })
  mimetype: string;
}
