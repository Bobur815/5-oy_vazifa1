import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto, UpdateCommentDto } from './dto/dto';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentService: CommentsService){}

    @Get()
    getAll(){
        return this.commentService.getAll()
    }

    @Post()
    createComment(@Body() payload:CommentDto[]){
        return this.commentService.createComment(payload)
    }

    @Put(':comment_id')
    updateComment(@Param('comment_id') comment_id:string, @Body() payload: UpdateCommentDto){
        return this.commentService.updateComment(comment_id, payload)
    }

    @Delete(':comment_id')
    deleteComment(@Param('comment_id') comment_id:string){
        return this.commentService.deleteComment(comment_id)
    }
}
