import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardGame, Session, Users } from 'entity/some.entity';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UUID } from 'crypto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    @InjectRepository(BoardGame) private readonly boardGameRepository: Repository<BoardGame>,
    @InjectRepository(Session) private readonly sessionRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const { boardGameId, ...sessionData } = createSessionDto;
    sessionData.skillsLvl = +sessionData.skillsLvl;
    const id = "295d6bfb-0bcc-4151-acb9-af3fa6fc8c04";
    const organizer = await this.userRepository.findOne({ where: { id } });
    if (!organizer) {
      throw new Error('Organizer not found');
    }
    const boardGameIdT = "39214b59-0834-4432-a052-067b3e76804f";
    const boardGame = await this.boardGameRepository.findOne({ where: { id: boardGameIdT } });
    if (!boardGame) {
      throw new Error('Board game not found');
    }

    const session = this.sessionRepository.create({
      ...sessionData,
      organizer,
      boardGame,
    });

    return this.sessionRepository.save(session);
  }
  
  async findAll(): Promise<Session[]> {
    return this.sessionRepository.find({ relations: ['organizer', 'players', 'boardGame', 'historyGames', 'customTags'] });
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({ where: { id }, relations: ['organizer', 'players', 'boardGame', 'historyGames', 'customTags'] });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    await this.sessionRepository.update(id, updateSessionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.sessionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Session not found');
    }
  }

  async findMySessions(userId: string, status?: string, place?: string, date?: string): Promise<Session[]> {
    status = !status ? "all" : status;
    console.log(status);
    const query = this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.players', 'player')
      .where('player.userId = :userId', { userId });

    if (place) {
      query.andWhere('session.place = :place', { place });
    }

    if (date) {
      query.andWhere('session.date = :date', { date });
    }


    return query.getMany();
  }
}
