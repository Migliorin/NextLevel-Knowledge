import { ApiProperty } from '@nestjs/swagger';

export class DocumentQuestionDto {
  @ApiProperty({
    example: 'Qual e o resumo deste documento?',
    description: 'Pergunta do usuario sobre o documento',
  })
  query!: string;
}
