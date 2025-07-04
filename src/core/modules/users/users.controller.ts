import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService:UsersService){}

    @Get()
    getAll(){
        return this.userService.getAll()
    }

    @Get('age')
    getAggregateAge(){
        return this.userService.getAggregateAge()
    }

    @Get(':id')
    getSingle(@Param('id') id:string){
        return this.userService.getSingle(id)
    }


    @Put(':id')
    updateUser(@Param('id') id:string, @Body() payload: UserDto){
        return this.userService.updateUser(id,payload)
    }

    @Delete(':id')
    deleteUser(@Param('id') id:string){
        return this.userService.deleteUser(id)
    }
}
