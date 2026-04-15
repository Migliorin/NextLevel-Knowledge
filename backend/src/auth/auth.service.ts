import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { scrypt as _scrypt, randomBytes} from "crypto";
import { promisify } from "util";
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '../dto/Auth/signIn.dto.js';
import { SignUpDto } from '../dto/Auth/signUp.dto.js';
import { AccessToken } from '../dto/Auth/accessToken.dto.js';
import { CurrentUserDto } from '../dto/Auth/currentUser.dto.js';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from '../dto/Auth/refreshToken.dto.js';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService, 
        private readonly config: ConfigService
    ){};

    private scrypt = promisify(_scrypt);

    async login(params: SignInDto) : Promise<AccessToken>{
        const {email, password} = params;
        const existUser = await this.prisma.user.findUnique({ where: { email: email } });
        
        if (!existUser) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const [salt, hash] = existUser.password.split('.');
        const passwordCyptd = await this.scrypt(password,salt,32) as Buffer;

        if(passwordCyptd.toString("hex") != hash){
            throw new UnauthorizedException('Credenciais inválidas'); 
        }

        const { refreshToken, accessToken } = this.createTokens(existUser);

        await this.prisma.user.update({ where: { email: email } ,data:{
            refreshToken: refreshToken
        }});

        return {
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }
    private extractInfoUser(existUser: any): CurrentUserDto{
        return {
            name: existUser.name,
            email: existUser.email,
            userId: existUser.id,
        };
    }

    private normalizeName(name: string): string {
        const trimmedName = name.trim().replace(/\s+/g, ' ');

        if (!/[ÃÂâ]/.test(trimmedName)) {
            return trimmedName.normalize('NFC');
        }

        try {
            return Buffer.from(trimmedName, 'latin1').toString('utf8').normalize('NFC');
        } catch {
            return trimmedName.normalize('NFC');
        }
    }

    async register(params: SignUpDto): Promise<AccessToken>{
        const {email, password, name} = params;
        const normalizedName = this.normalizeName(name);
        const existUser = await this.prisma.user.findUnique({ where: { email: email } });
        
        if (existUser) {
            throw new UnauthorizedException('Email não disponível para uso');
        }

        const salt = randomBytes(8).toString('hex');
        
        const key = await scrypt(password,salt,32) as Buffer;
    
        const passwordHash = `${salt}.${key.toString('hex')}`;

        const prismaInfo = await this.prisma.user.upsert({
            where: { email: email },
            update: {},
            create: {
                email: email,
                password: passwordHash,
                name: normalizedName
            }
        })

        const { refreshToken, accessToken } = this.createTokens(prismaInfo);
        
        await this.prisma.user.update({ where: { email: email } ,data:{
            refreshToken: refreshToken
        }});

        return {
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }

    private createTokens(data: any) {

        const extractUser = this.extractInfoUser(data);
        
        const accessToken = this.jwtService.sign(
            { ...extractUser, type: "access" }
        );
        const refreshToken = this.jwtService.sign(
            { ...extractUser, type: "refresh" },
            { expiresIn: this.config.getOrThrow("REFRESH_EXPIRESS_IN") }
        );
        return { refreshToken, accessToken };
    }

    async refresh(params:RefreshTokenDto): Promise<AccessToken>{
        const {refresh_token} = params;

        let payload: any;

        try {
            payload = this.jwtService.verify(refresh_token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido'); 
        }

        const existUser = await this.prisma.user.findFirst({
            where: {
                id: payload.userId,
                refreshToken: refresh_token
            }
        });

        if(payload.type !== 'refresh' || ! existUser){
            throw new UnauthorizedException('Token inválido'); 
        }

        const { refreshToken, accessToken } = this.createTokens(existUser);

        await this.prisma.user.update({
            where: { id: existUser.id },
            data: {
                refreshToken: refreshToken
            }
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }
}
