import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from 'passport-jwt'
import { CurrentUserDto } from "src/dto/Auth/currentUser.dto.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            secretOrKey: config.getOrThrow("JWT_SECRET"),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false
        });
    }

    async validate(payload: any): Promise<CurrentUserDto> {
        if (payload.type !== 'access') {
            throw new UnauthorizedException('Tipo de token inválido');
        }

        return {
            userId: payload.userId,
            email: payload.email,
            name: payload.name
        };
    }
}