import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CommentDto {
    @IsNotEmpty()
    body:string

    @IsNotEmpty()
    @IsUUID()
    postId:string

    @IsNotEmpty()
    @IsUUID()
    userId:string
}

export class UpdateCommentDto extends PartialType(CommentDto){}
