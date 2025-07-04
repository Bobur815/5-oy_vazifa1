import { Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserDto } from './dto/dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma:PrismaService
    ){}

    async getAll() {
        const users = await this.prisma.user.findMany({
            select: {
            id: true,
            name: true,
            email: true,
            age: true,
            isActive: true,
            posts: {
                select: {
                title: true,
                body: true,
                createdAt: true,
                comments: {
                    select: {
                    body: true,
                    createdAt: true
                    }
                }
                }
            }
            }
        });

        return users;
    }


    async getSingle(id:string){
        const user = await this.prisma.user.findFirst({
            where:{id},
            select: {
            id: true,
            name: true,
            email: true,
            age: true,
            isActive: true,
            posts: {
                select: {
                title: true,
                body: true,
                createdAt: true,
                comments: {
                    select: {
                    body: true,
                    createdAt: true
                    }
                }
                }
            }
            }
        })
        return user
    }

    async getAggregateAge(){
        const users = await this.prisma.user.aggregate({
            _avg:{age:true},
            _max:{age:true},
            _min:{age:true}
        })
        console.log("kel");
        
         return {
            averageAge: users._avg.age,
            maxAge: users._max.age,
            minAge: users._min.age
        };
    }

    async updateUser(id:string, payload:UserDto){
        const user = await this.prisma.user.findFirst({where:{id}})
        if(!user){
            throw new NotFoundException("User not found")
        }

        const updatedUser = await this.prisma.user.update({
            where:{id},
            data:payload,
        })

        return {
            message:"User updated successfully",
            date:updatedUser
        }
    }

    async deleteUser(id:string){
        const user = await this.prisma.user.findFirst({where:{id}})
        if(!user){
            throw new NotFoundException("User not found")
        }

        await this.prisma.user.delete({where:{id}})
        
        return "User deleted successfully"
    }
}
