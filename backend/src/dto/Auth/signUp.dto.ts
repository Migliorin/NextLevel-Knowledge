import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'Email do usuário',
  })
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'Senha da conta',
  })
  password: string;

  @ApiProperty({
    example: 'João Silva do Carmo Ramos',
    description: 'Nome do usuário',
  })
  name: string;
}