import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'entity/some.entity';
  import { Repository } from 'typeorm';
  
  @Injectable()
  export class UserService {
    constructor(
      @InjectRepository(Users)
      private readonly usersRepository: Repository<Users>,
    ) {    }
  
    // Получение всех пользователей
    async getAllUsers(): Promise<Users[]> {
        const user = await this.usersRepository.find();
        if (!user) throw new NotFoundException('Пользователь не найден');
        return user;
    }
  
    // Получение пользователя по ID
    async getUserById(id: string): Promise<Users> {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException('Пользователь не найден');
      return user;
    }
  
    // Создание нового пользователя
    async createUser(userData: Partial<Users>): Promise<Users> {
      const user = this.usersRepository.create(userData);
      return await this.usersRepository.save(user);
    }
  
    // Обновление данных пользователя
    async updateUser(id: string, updateData: Partial<Users>): Promise<Users> {
      const user = await this.getUserById(id);
      Object.assign(user, updateData);
      return await this.usersRepository.save(user);
    }
  
    // Удаление пользователя
    async deleteUser(id: string): Promise<void> {
      const user = await this.getUserById(id);
      await this.usersRepository.remove(user);
    }
  
    // Блокировка пользователя
    async blockUser(id: string): Promise<Users> {
      const user = await this.getUserById(id);
      if (user.statusProfile === 'inactive') {
        throw new BadRequestException('Пользователь уже заблокирован');
      }
      user.statusProfile = 'inactive';
      return await this.usersRepository.save(user);
    }
  
    // Разблокировка пользователя
    async unblockUser(id: string): Promise<Users> {
      const user = await this.getUserById(id);
      if (user.statusProfile === 'active') {
        throw new BadRequestException('Пользователь уже активен');
      }
      user.statusProfile = 'active';
      return await this.usersRepository.save(user);
    }
  }
  