import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoryGame, Players, Session } from 'entity/some.entity';
import { Repository } from 'typeorm';
import { CreateHistoryGameDto } from './dto/create-board-game.dto';
import { UpdateHistoryGameDto } from './dto/update-board-game.dto';


@Injectable()
export class HistoryGameService {
  constructor(
    @InjectRepository(HistoryGame)
    private readonly historyGameRepository: Repository<HistoryGame>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(Players)
    private readonly playersRepository: Repository<Players>,
  ) {}

  async create(dto: CreateHistoryGameDto): Promise<HistoryGame> {
    const session = await this.sessionRepository.findOne({ where: { id: dto.sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const players = await this.playersRepository.findByIds(dto.players);
    if (!players.length) throw new NotFoundException('Players not found');

    const historyGame = this.historyGameRepository.create({ ...dto, session, players });
    return this.historyGameRepository.save(historyGame);
  }

  async findAll(): Promise<HistoryGame[]> {
    return this.historyGameRepository.find({ relations: ['session', 'players'] });
  }

  async findOne(id: string): Promise<HistoryGame> {
    const historyGame = await this.historyGameRepository.findOne({ where: { id }, relations: ['session', 'players'] });
    if (!historyGame) throw new NotFoundException('History game not found');
    return historyGame;
  }

  async update(id: string, dto: UpdateHistoryGameDto): Promise<HistoryGame> {
    const historyGame = await this.findOne(id);

    if (dto.sessionId) {
      const session = await this.sessionRepository.findOne({ where: { id: dto.sessionId } });
      if (!session) throw new NotFoundException('Session not found');
      historyGame.session = session;
    }

    if (dto.players) {
      const players = await this.playersRepository.findByIds(dto.players);
      historyGame.players = players;
    }

    Object.assign(historyGame, dto);
    return this.historyGameRepository.save(historyGame);
  }

  async remove(id: string): Promise<void> {
    const historyGame = await this.findOne(id);
    await this.historyGameRepository.remove(historyGame);
  }
}
