import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateUserWithPostDto, LoginDto, RegisterDto } from './dto/dto';
import * as bcrypt from 'bcrypt';
import { VerificationDto } from './dto/verification.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { AppMailerService } from 'src/common/mailer/mailer.service';
import { JwtPayload } from 'src/common/jwt/jwt-strategy';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessToken, JwtRefreshToken } from 'src/common/jwt/jwt-sign';

@Injectable()
export class AuthService {
    constructor(
        private prisma:PrismaService,
        private readonly redisService: RedisService,
        private readonly mailService: AppMailerService,
        private readonly jwtService:JwtService

    ){}

    private async generateToken(payload: JwtPayload, accessTokenOnly=false){
            
            const accessToken = await this.jwtService.signAsync({id: payload.id, role: payload.email},JwtAccessToken)
            
            if(accessTokenOnly){
                return {
                    accessToken
                }
            }
            const refreshToken = await this.jwtService.signAsync({id: payload.id, role: payload.email},JwtRefreshToken)
            return {
                accessToken,
                refreshToken
            }

    }
    async register(payload:RegisterDto){
        
        const isExistEmail = await this.prisma.user.findFirst({
            where:{email:payload.email}
        })

        if(isExistEmail) {
            throw new ConflictException("Email already exist")
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000)
        
        await this.mailService.sendVerificationCode(payload.email,payload,verificationCode)
        await this.redisService.set(`register:${payload.email}`, JSON.stringify({...payload,verificationCode}), 900)

        return {
                message:`Verification code sent to ${payload.email}`
        }
    }

    async registerUserWithPost(payload:CreateUserWithPostDto){
        return this.prisma.$transaction(async (tr) => {
            const user = await tr.user.create({
                data: {
                    name:payload.name,
                    email:payload.email,
                    age:payload.age,
                    password:payload.password
                }
            })

            const post = await tr.post.create({
                data:{
                    title:payload.postTitle,
                    body:payload.postBody,
                    userId:user.id
                }
            })

            return {
                message: 'User and post created successfully',
                user,
                post
            };

        })
    }

    async verify(payload: VerificationDto){
            let stored = await this.redisService.get(`register:${payload.email}`)
        
            if(!stored){
                throw new BadRequestException('Verification code expired or not found')
            }
            let userData = JSON.parse(stored)
            
            
            if(userData.verificationCode !== payload.code){
                throw new BadRequestException("Verification code invalid")
            }

            await this.redisService.del(`register:${payload.email}`)
            delete userData.verificationCode

            const password_hash = await bcrypt.hash(userData.password,10)
            let newUser = await this.prisma.user.create({data:{...userData,password:password_hash}})
            
            let tokens = await this.generateToken({id:newUser.id, email:newUser.email})
            return {
                success: true,
                message: 'Registiration successfull ',
                tokens
            }
    }

    async login(payload:LoginDto){
        const user = await this.prisma.user.findFirst({
            where:{email:payload.email}
        })
        if(!user) {
            throw new NotFoundException("User not registered yet")
        }

        const isMatch = await bcrypt.compare(payload.password,user.password)
        if(!isMatch){
            throw new ConflictException("Password incorrect")
        }

        return {
            message:"Login successfull",
            accesToken:"cfcfjnfjvn"
        }
    }
}
