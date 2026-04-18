import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { CurrentUserDto } from 'src/dto/Auth/currentUser.dto.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      secretOrKey: config.getOrThrow('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: any): Promise<CurrentUserDto> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Tipo de token inválido');
    }

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!token || (await this.redisService.isAccessTokenBlacklisted(token))) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  }
}
