import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CommentDto, UpdateCommentDto } from './dto/dto';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma:PrismaService){}

    async getAll(){
        const comments = await this.prisma.comment.findMany()
        return comments
    }

    async createComment(payload:CommentDto[]){
        let createdComments:CommentDto[] = []

        for(let comment of payload){
            const user = await this.prisma.user.findUnique({where:{id:comment.userId}})
            const post = await this.prisma.post.findUnique({where:{id:comment.postId}})
            if(!user || !post){
                continue
            }

            createdComments.push(comment)
        }

        if(!createdComments.length){
            throw new NotFoundException("No valid user or post found")
        }

        const newComments = await this.prisma.comment.createMany({data:createdComments})
        return {
            message:`${newComments.count} comments successfully created`
        }
    }  
    
    async updateComment(comment_id:string, payload:UpdateCommentDto){
        const comment = await this.prisma.comment.findUnique({where:{id:comment_id}})
        if(!comment) throw new NotFoundException("Comment not found")

        const updatedComment = await this.prisma.comment.update({
            where:{id:comment_id},
            data: {
                ...(comment.body && {body:payload.body}),
                ...(comment.postId && {postId: payload.postId}),
                ...(comment.userId && {userId: payload.userId})
            }
        })

        return {
            message: "comment successfully updated",
            data:updatedComment
        }
    }

    async deleteComment(comment_id:string){
        const comment = await this.prisma.comment.findUnique({where:{id:comment_id}})
        if(!comment) throw new NotFoundException("Comment not found")

        await this.prisma.comment.delete({where:{id:comment_id}})
        return "comment successfully deleted"
    }
}
