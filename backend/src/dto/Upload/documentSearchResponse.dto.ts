import { ApiProperty } from '@nestjs/swagger';

export class DocumentSearchResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID do documento consultado',
  })
  document_id!: number;

  @ApiProperty({
    example: 'Qual e o resumo deste documento?',
    description: 'Pergunta enviada para a IA',
  })
  query!: string;

  @ApiProperty({
    description: 'Historico de raciocinio/recuperacao retornado pela IA',
  })
  cot!: unknown;

  @ApiProperty({
    example: 'O documento apresenta...',
    description: 'Resposta final retornada pela IA',
  })
  answer!: string;

  @ApiProperty({
    description: 'Trechos recuperados pela IA',
  })
  chunks!: unknown;
}
