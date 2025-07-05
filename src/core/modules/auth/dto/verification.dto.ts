
import { IsEmail, IsNotEmpty, IsNumber } from "class-validator"

export class VerificationDto{
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsNumber()
    code: number
}