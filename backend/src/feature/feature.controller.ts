import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuards } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CurrentUserDto } from '../dto/Auth/currentUser.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('feature')
@ApiBearerAuth('jwt')
export class FeatureController {
    @Get("public")
    getPublicFeature(){
        return "Rota publica"
    }

    @Get("private")
    @UseGuards(JwtAuthGuards)
    getPrivateFeature(@CurrentUser() user: CurrentUserDto){
        return `Rota privada protegida por token do usuario ${user.name}`
    }

}
