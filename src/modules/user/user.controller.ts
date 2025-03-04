import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UsePipes,
    ValidationPipe,
    Inject,
  } from '@nestjs/common';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { UserService } from './user.service';
  
  @Controller('user')
  export class UserController {
    constructor(@Inject(UserService) private readonly userService: UserService) {  }
  
    @Get()
    async getAllUsers() {
      console.log('UserService instance in Controller:', this.userService); // Вот так правильнее
      return await this.userService.getAllUsers();
    }
  
    @Get(':id')
    async getUserById(@Param('id') id: string) {
      return await this.userService.getUserById(id);
    }
  
    @Post()
    @UsePipes(new ValidationPipe())
    async createUser(@Body() createUserDto: CreateUserDto) {
      return await this.userService.createUser(createUserDto);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe())
    async updateUser(
      @Param('id') id: string,
      @Body() updateUserDto: UpdateUserDto,
    ) {
      return await this.userService.updateUser(id, updateUserDto);
    }
  
    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
      return await this.userService.deleteUser(id);
    }
  
    @Put(':id/block')
    async blockUser(@Param('id') id: string) {
      return await this.userService.blockUser(id);
    }
  
    @Put(':id/unblock')
    async unblockUser(@Param('id') id: string) {
      return await this.userService.unblockUser(id);
    }
  }
  