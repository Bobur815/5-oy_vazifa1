import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostDto, UpdatePostDto } from './dto/dto';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService:PostsService
    ){}

    @Get()
    getAllPosts(){
        return this.postsService.getAll()
    }

    @Post('bulk')
    createPost(@Body() payload:PostDto[]){
        return this.postsService.createPost(payload)
    }

    @Put(':post_id')
    updatePost(@Param('post_id') post_id:string, @Body() payload:UpdatePostDto){
        return this.postsService.updatePost(post_id,payload)
    }

    @Delete(':post_id')
    deletePost(@Param('post_id') post_id:string){
        return this.postsService.deletePost(post_id)
    }
}
