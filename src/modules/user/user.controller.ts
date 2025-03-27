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
    Request,
    Patch,
  } from '@nestjs/common';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { UserService } from './user.service';
  import { FirebaseService } from '../firebase/firebase-service';
import { LocalAuthGuard } from 'auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
  
  @Controller('user')
  export class UserController {
    constructor(@Inject(UserService) private readonly userService: UserService) {  }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllUsers() {
      return await this.userService.getAllUsers();
    }

    // Работа с профилем 
    @UseGuards(JwtAuthGuard)
    @Get("profile")
    async getProfile(@Request() req) {
      return await this.userService.getProfile(req.user.id);
    }

    // Работа с профилем 
    @UseGuards(JwtAuthGuard)
    @Get("profile/:id")
    async getProfileOther( @Param("id") id: string) {
      console.log(id);
      return await this.userService.getProfile(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
      return await this.userService.updateProfile(req.user.id, updateProfileDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/profile/add/games')
    async addGameToProfile(
      @Request() req, 
      @Body() gameData: { nameBoardGame: string, mastery: number }
    ) {
      const userId = req.user.id;
      return await this.userService.addGameToProfile(userId, gameData);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/profile/games/:id')
    async removeGameFromProfile(
      @Request() req, 
      @Param("id") id: string
    ) {
      const userId = req.user.id;
      return await this.userService.removeGameFromProfile(userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/profile/games/skils/:id')
    async updateGameMastery(
      @Request() req, 
      @Param("id") id: string,
      @Body() mastery: {mastery: number}
    ) {
      console.log(mastery.mastery);
      const userId = req.user.id;
      return await this.userService.updateGameMastery(userId, id, mastery.mastery);
    }
  
    // ----------
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
  