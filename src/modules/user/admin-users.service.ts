import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'entity/some.entity';
import { Repository } from 'typeorm';


@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async getAllUsers({ page, limit, search, role }: { page: number; limit: number; search: string; role: string }) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.nickname',
        'user.email',
        'user.role',
        'user.mainPhoto',
        'user.statusProfile',
      ]);
  
    if (search) {
      query.andWhere('(user.nickname LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }
  
    if (role) {
      query.andWhere('user.role = :role', { role });
    }
  
    query.skip((page - 1) * limit).take(limit);
  
    const [users, total] = await query.getManyAndCount();
  
    return {
      total,
      users,
    };
  }
  
  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserRole(id: string, role: string) {
    const user = await this.getUserById(id);
    user.role = role;
    return await this.userRepository.save(user);
  }

  async blockUser(id: string) {
    const user = await this.getUserById(id);
    user.statusProfile = 'inactive';
    return await this.userRepository.save(user);
  }

  async unblockUser(id: string) {
    const user = await this.getUserById(id);
    user.statusProfile = "active";
    return await this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    return await this.userRepository.remove(user);
  }
}