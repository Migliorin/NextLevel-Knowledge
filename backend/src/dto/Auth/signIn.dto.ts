import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'Email do usuário',
  })
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'Senha do usuário',
  })
  password: string;
}