import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:config.getOrThrow("JWT_SECRET"),
        signOptions: {expiresIn: config.getOrThrow("EXPIRESS_IN")}
      }),
    })
  ],
  providers: [AuthService,PrismaService,JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy]
})
export class AuthModule {}
