import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserWithPostDto, LoginDto, RegisterDto } from './dto/dto';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService: AuthService){}

    @Post('register')
    register(@Body() payload: RegisterDto[]){
        return this.authService.register(payload)
    }

    @Post('register/user/post')
    registerUserWithPost(@Body() payload: CreateUserWithPostDto){
        return this.authService.registerUserWithPost(payload)
    }

    @Post('login')
    login(@Body() payload: LoginDto){
        return this.authService.login(payload)
    }
}
