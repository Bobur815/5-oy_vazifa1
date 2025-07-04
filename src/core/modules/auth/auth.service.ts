import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateUserWithPostDto, LoginDto, RegisterDto } from './dto/dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma:PrismaService
    ){}

    async register(payload:RegisterDto[]){
        let createdUsers:RegisterDto[] = []

        for (let user of payload){
            const isExistEmail = await this.prisma.user.findFirst({
                where:{email:user.email}
            })

            if(isExistEmail) {
                continue
            }

            const hash_password = await bcrypt.hash(user.password,10)

            const newUser = await this.prisma.user.create({
                data:{
                    ...user,
                    password:hash_password
                }
            })
            createdUsers.push(newUser)
        }


        return {
            message:"New user successfully created",
            createdUsers,
            accessToken:'dncjnfvf'
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
