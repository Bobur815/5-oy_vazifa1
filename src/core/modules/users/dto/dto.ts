import { IsEmail, IsInt, IsString, MinLength } from "class-validator";

export class UserDto {
    @IsString()
      name: string;
    
      @IsInt()
      age: number;
    
      @IsEmail()
      email: string;
    
      @IsString()
      @MinLength(6)
      password: string;
}
