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
    UseGuards,
  } from '@nestjs/common';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { UserService } from './user.service';
import { LocalAuthGuard } from 'auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
  
  @Controller('user')
  export class UserController {
    constructor(@Inject(UserService) private readonly userService: UserService) {  }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllUsers() {
      return await this.userService.getAllUsers();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUserById(@Param('id') id: string) {
      return await this.userService.getUserById(id);
    }
  
    @Post()
    @UsePipes(new ValidationPipe())
    async createUser(@Body() createUserDto: CreateUserDto) {
      return await this.userService.createUser(createUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @UsePipes(new ValidationPipe())
    async updateUser(
      @Param('id') id: string,
      @Body() updateUserDto: UpdateUserDto,
    ) {
      return await this.userService.updateUser(id, updateUserDto);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
      return await this.userService.deleteUser(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/block')
    async blockUser(@Param('id') id: string) {
      return await this.userService.blockUser(id);
    }
    
    @UseGuards(JwtAuthGuard)
    @Put(':id/unblock')
    async unblockUser(@Param('id') id: string) {
      return await this.userService.unblockUser(id);
    }
  }
  