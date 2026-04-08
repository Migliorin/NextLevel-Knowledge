import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { SignInDto } from '../dto/Auth/signIn.dto.js';
import { AccessToken } from '../dto/Auth/accessToken.dto.js';
import { SignUpDto } from '../dto/Auth/signUp.dto.js';
import { RefreshTokenDto } from '../dto/Auth/refreshToken.dto.js';

@ApiTags('Auth')
@Controller('')
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
  @ApiOperation({ summary: 'Solicitar novo Access Token' })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token',
  })
  @ApiCreatedResponse({
    description: 'Novo Access e Refresh Token',
    type: AccessToken,
  })
  refresh(@Body() body: RefreshTokenDto): Promise<AccessToken>{
    return this.authService.refresh(body);
  }
}