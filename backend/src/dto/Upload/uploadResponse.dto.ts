import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID do arquivo criado',
  })
  id!: number;

  @ApiProperty({
    example: 'documents',
    description: 'Nome do bucket onde o arquivo foi salvo',
  })
  bucket!: string;

  @ApiProperty({
    example:
      'c6f7c1d2-9f14-4fd2-8c7b-1d3d7d2f9abc/7c0f2ec4-2e87-4c1f-bb08-3d0cf3f7e5d1.pdf',
    description: 'Chave do objeto no MinIO',
  })
  objectName!: string;

  @ApiProperty({
    example: 'meu-arquivo.pdf',
    description: 'Nome original do arquivo enviado',
  })
  originalName!: string;

  @ApiProperty({
    example: 'Relatorio financeiro do Q2 com receita, custos e projecoes.',
    description: 'Descricao breve informada no upload',
    nullable: true,
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    example: 0,
    description: 'Status de extracao do arquivo para RAG: 0 pendente, 1 extraindo, 2 extraido, 3 erro',
  })
  status!: number;

  @ApiProperty({
    example: 0,
    description: 'ID do status de extracao do arquivo para RAG',
  })
  statusId!: number;

  @ApiProperty({
    example: '2026-04-15T12:00:00.000Z',
    description: 'Data de criacao do registro do arquivo',
  })
  createdAt!: Date;

  @ApiProperty({
    example: 245760,
    description: 'Tamanho do arquivo em bytes',
  })
  size!: number;

  @ApiProperty({
    example: 'application/pdf',
    description: 'Tipo MIME do arquivo enviado',
  })
  mimetype!: string;
}
