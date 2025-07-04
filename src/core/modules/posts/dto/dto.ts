import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsUUID, MaxLength } from "class-validator";

export class PostDto {
    @IsNotEmpty()
    @MaxLength(30)
    title:string

    @IsNotEmpty()
    body:string

    @IsNotEmpty()
    @IsUUID()
    userId:string
}

export class UpdatePostDto extends PartialType(PostDto){}