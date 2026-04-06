import { ApiProperty } from '@nestjs/swagger';

export class AccessToken {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de acesso',
  })
  access_token: string;
}