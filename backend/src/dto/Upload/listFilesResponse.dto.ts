import { ApiProperty } from '@nestjs/swagger';

export class ListFilesResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID do arquivo',
  })
  id!: number;

  @ApiProperty({
    example: 'meu-arquivo.pdf',
    description: 'Nome original do arquivo enviado',
  })
  name!: string;

  @ApiProperty({
    example: '2026-04-15T12:00:00.000Z',
    description: 'Data de criacao do registro do arquivo',
  })
  createdAt!: Date;

  @ApiProperty({
    example: false,
    description: 'Status de extração do arquivo para RAG'
  })
  extracted!: boolean;
}
