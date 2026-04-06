import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { scrypt as _scrypt, randomBytes} from "crypto";
import { promisify } from "util";
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '../dto/Auth/signIn.dto.js';
import { SignUpDto } from '../dto/Auth/signUp.dto.js';
import { AccessToken } from 'src/dto/Auth/accessToken.dto.js';
import { CurrentUserDto } from 'src/dto/Auth/currentUser.dto.js';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService,private readonly jwtService: JwtService){};

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

        // const payload = {username:email, sub: existUser.id}
        // return {
        //     access_token: this.jwtService.sign(payload),
        // };
        return {
            access_token: this.jwtService.sign(this.extractInfoUser(existUser))
        };
    }
    private extractInfoUser(existUser: any): CurrentUserDto{
        return {
            name: existUser.name,
            email: existUser.email,
            userId: existUser.id
        };
    }

    async register(params: SignUpDto): Promise<AccessToken>{
        const {email, password, name} = params;
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
                name: name
            }
        })

        return {
            access_token: this.jwtService.sign(this.extractInfoUser(prismaInfo))
        };
    }
}
