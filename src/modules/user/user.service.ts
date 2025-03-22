import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'entity/some.entity';
import { Repository } from 'typeorm';
import * as argon from 'argon2';  
import { JwtService } from '@nestjs/jwt';
  @Injectable()
  export class UserService {
    constructor(
      @InjectRepository(Users)
      private readonly usersRepository: Repository<Users>,
      @Inject(JwtService) private readonly jwtService: JwtService,
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
    async createUser(userData: Partial<Users>){
      if (!userData.hashPassword) {
        throw new BadRequestException('Password is required');
      }
    
      userData.hashPassword = await argon.hash(userData.hashPassword);
      console.log()
      const user = this.usersRepository.create({
        ...userData, // Передаём все данные
      });
      const token = this.jwtService.sign({id: user.id, role: user.role, status: user.statusProfile}, { secret: process.env.JWT_SECRET })
      const saveUser = await this.usersRepository.save(user);
      return {saveUser, token};
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

    async findOneByEmail(email: string) {
      return this.usersRepository.findOne({where: {email: email}})
    }
  }
  