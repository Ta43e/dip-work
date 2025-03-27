import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Players, Session, Users } from 'entity/some.entity';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Players)
    private readonly playersRepository: Repository<Players>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async create(userId: string, createPlayerDto: CreatePlayerDto): Promise<Players> {
    const { eventId,  namePlayer, phoneNumber} = createPlayerDto;
    console.log(namePlayer + " " + phoneNumber)
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const session = await this.sessionRepository.findOne({ where: { id: eventId } });
    if (!session) throw new Error('Session not found');

    const player = this.playersRepository.create({ 
      user, 
      session,
      namePlayer,
      phoneNumber
    });

    return this.playersRepository.save(player);
  }

  async findAll(): Promise<Players[]> {
    return this.playersRepository.find({ relations: ['user', 'session'] });
  }

  async findOne(id: string): Promise<Players | null> {
    return this.playersRepository.findOne({ where: { id }, relations: ['user', 'session'] });
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Players | null> {
    const { userId, sessionId } = updatePlayerDto;
  
    const updateData: Partial<Players> = {};
  
    if (userId) {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      updateData.user = user;
    }
  
    if (sessionId) {
      const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
      if (!session) throw new Error('Session not found');
      updateData.session = session;
    }
  
    await this.playersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.playersRepository.delete(id);
  }
}
