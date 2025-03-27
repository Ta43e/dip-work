import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UsePipes,
    ValidationPipe,
    Inject,
    UseGuards,
    Patch,
  } from '@nestjs/common';
  import { UserService } from './user.service';
  import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AdminUsersService } from './admin-users.service';
import { error } from 'console';
  
  @Controller('admin/users')
  export class AdminUserController {
    constructor(@Inject(AdminUsersService) private readonly userService: AdminUsersService) {}
  
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllUsers(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
      @Query('search') search = '',
      @Query('role') role = ''
    ) {

      return await this.userService.getAllUsers({ page, limit, search, role });
    }
  
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUserById(@Param('id') id: string) {
      return await this.userService.getUserById(id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Patch(':id/role')
    @UsePipes(new ValidationPipe())
    async updateUserRole(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
        if (updateUserRoleDto.role)   {
            return await this.userService.updateUserRole(id, updateUserRoleDto.role);
        }  
        else return {error: "Ошибка изменнения роли"}
    }
  
    @UseGuards(JwtAuthGuard)
    @Post(':id/block')
    async blockUser(@Param('id') id: string) {
      return await this.userService.blockUser(id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post(':id/unblock')
    async unblockUser(@Param('id') id: string) {
      return await this.userService.unblockUser(id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
      return await this.userService.deleteUser(id);
    }
  }
  