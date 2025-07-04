import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  age: number;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
} 

export class CreateUserWithPostDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password:string

  @IsNotEmpty()
  age: number;

  @IsNotEmpty()
  postTitle: string;

  @IsNotEmpty()
  postBody: string;
}
