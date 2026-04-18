import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessToken } from '../dto/Auth/accessToken.dto.js';
import { RefreshTokenDto } from '../dto/Auth/refreshToken.dto.js';
import { SignInDto } from '../dto/Auth/signIn.dto.js';
import { SignUpDto } from '../dto/Auth/signUp.dto.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuards } from './jwt-auth.guard.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiBody({
    type: SignInDto,
    description: 'Credenciais de acesso do usuário',
  })
  @ApiCreatedResponse({
    description: 'Token JWT gerado com sucesso',
    type: AccessToken,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas',
  })
  login(@Body() body: SignInDto): Promise<AccessToken> {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiBody({
    type: SignUpDto,
    description: 'Dados necessários para criação da conta',
  })
  @ApiCreatedResponse({
    description: 'Usuário registrado e token gerado com sucesso',
    type: AccessToken,
  })
  register(@Body() body: SignUpDto): Promise<AccessToken> {
    return this.authService.register(body);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuards)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Solicitar novo Access Token' })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token',
  })
  @ApiCreatedResponse({
    description: 'Novo Access e Refresh Token',
    type: AccessToken,
  })
  refresh(
    @Body() body: RefreshTokenDto,
    @Headers('authorization') authorization?: string,
  ): Promise<AccessToken> {
    return this.authService.refresh(body, authorization);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuards)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Encerrar sessão do usuário' })
  async logout(
    @CurrentUser() user: { userId: number },
    @Headers('authorization') authorization?: string,
  ): Promise<void> {
    return this.authService.logout(user.userId, authorization);
  }
}
