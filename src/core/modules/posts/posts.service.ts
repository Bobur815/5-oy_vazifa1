import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { PostDto, UpdatePostDto } from './dto/dto';

@Injectable()
export class PostsService {
    constructor(
        private readonly prisma:PrismaService
    ){}

    async getAll(){
        const posts = await this.prisma.post.findMany({
            include: {
                comments:true
            }
        })
        return posts
    }

    async createPost(payload:PostDto[]){
        let createdPosts:PostDto[] = []

        for(let post of payload){
            const user = await this.prisma.user.findFirst({where:{id:post.userId}})
            if(!user){
                continue
            }
            createdPosts.push(post)
        }
        if(!createdPosts.length){
            throw new Error('No valid users found for post creation');
        }

        const newPosts = await this.prisma.post.createMany({data:createdPosts})
        return {
            message: `${newPosts.count} posts successfully created`
        }
    }

    async updatePost(post_id:string,payload:UpdatePostDto){
        const post = await this.prisma.post.findUnique({where:{id:post_id}})
        if(!post){
            throw new NotFoundException("Post not found")
        }

        const updatedPost = await this.prisma.post.update({
            where:{id:post_id},
            data: {
                ...(payload.title && {title:payload.title}),
                ...(payload.body && {body:payload.body}),
                ...(payload.userId && {userId:payload.userId})
            }
        })
         return {
            message: 'Post updated successfully',
            data: updatedPost
        };
    }

    async deletePost(post_id:string){
        const post = await this.prisma.post.findUnique({where:{id:post_id}})
        if(!post){
            throw new NotFoundException("Post not found")
        }

        await this.prisma.post.delete({where:{id:post_id}})
        return "Post successfully deleted"
    }
}
