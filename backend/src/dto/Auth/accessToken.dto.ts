import { ApiProperty } from '@nestjs/swagger';

export class AccessToken {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access Token de acesso',
  })
  access_token!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInhjbjHBjhJhbJNK(33)...',
    description: 'Refresh Token de refresh',
  })
  refresh_token!: string;
}