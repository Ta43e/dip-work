import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoryGame, Players, Session } from 'entity/some.entity';
import { Repository } from 'typeorm';
import { UpdateHistoryGameDto } from './dto/update-board-game.dto';
import { CreateHistoryDto } from './dto/create-history.dto.ts';


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

  async createHistory(eventId: string, createHistoryDto: CreateHistoryDto) {
    console.log(createHistoryDto)
    const session = await this.sessionRepository.findOne({
      where: { id: eventId },
      relations: ["players", "historyGames"],
    });
  
    if (!session) {
      throw new NotFoundException("Сессия не найдена");
    }
  
    let history = await this.historyGameRepository.findOne({
      where: { session: { id: eventId } },
    });
  
    if (createHistoryDto.hasNoResults !== 0 && createHistoryDto.hasNoResults !== null) {
      if (history) {
        // Обнуляем результаты игроков и отвязываем их от истории
        await this.playersRepository.update(
          { historyGame: history },
          { result: 0, score: 0, historyGame: null }
        );
    
        // Обновляем саму историю, меняя её тип
        history.result = createHistoryDto.hasNoResults;
        await this.historyGameRepository.save(history);
      }
      return { message: "Результаты сброшены, но история сохранена" };
    }
  
    const totalResult =
      createHistoryDto.results?.reduce((acc, p) => acc + (p.result ?? 0), 0) || 0;
  
    if (history) {
      // Обновляем существующую историю
      history.result = createHistoryDto.hasNoResults;
      await this.historyGameRepository.save(history);
    } else {
      // Создаём новую историю
      history = this.historyGameRepository.create({
        session,
        result: createHistoryDto.hasNoResults,
      });
      await this.historyGameRepository.save(history);
    }
  
    if (createHistoryDto.results?.length) {
      for (const playerDto of createHistoryDto.results) {
        const player = await this.playersRepository.findOne({ where: { id: playerDto.id } });
        if (player) {
          player.historyGame = history;
          player.result = playerDto.result ?? 0;
          player.score = playerDto.score ?? 0;
          await this.playersRepository.save(player);
        }
      }
    }
  
    return history;
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

  async deleteAllHistory(): Promise<void> {
    await this.historyGameRepository.query('TRUNCATE TABLE "history_game" CASCADE');
  }
}
