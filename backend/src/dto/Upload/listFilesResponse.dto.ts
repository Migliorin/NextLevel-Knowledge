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
    example: 0,
    description: 'Status de extracao do arquivo para RAG: 0 pendente, 1 extraindo, 2 extraido, 3 erro',
  })
  status!: number;
}
