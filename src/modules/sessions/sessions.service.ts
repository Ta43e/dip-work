import { Inject, Injectable, NotFoundException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardGame, Players, Session, Users } from 'entity/some.entity';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { EventStatus } from './types/eventStatus';
import { TelegramService } from 'modules/tg-bot/telegram.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    @InjectRepository(BoardGame) private readonly boardGameRepository: Repository<BoardGame>,
    @InjectRepository(Session) private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Players) private readonly playersRepository: Repository<Players>,
    @Inject(TelegramService) private readonly telegramBotService: TelegramService,
  ) {}

  async create(createSessionDto: CreateSessionDto, id: string): Promise<Session> {
    const { game, ...sessionData } = createSessionDto;
    sessionData.skillsLvl = +sessionData.skillsLvl;
    const organizer = await this.userRepository.findOne({ where: { id } });
    if (!organizer) {
      throw new Error('Organizer not found');
    }
    const boardGame = await this.boardGameRepository.findOne({ where: { nameBoardGame: game } });
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
  
  async findAll(boardGameName: string) {
    const sessions = await this.sessionRepository.find({
      relations: ['organizer', 'players', 'players.user', 'players.user.skills', 'boardGame', 'customTags',         'historyGames',
        'historyGames.players',],
      where: { boardGame: { nameBoardGame: boardGameName } },
    });
  
    return sessions.map((session) => ({
      id: session.id,
      sessionName: session.sessionName,
      place: session.place,
      date: session.date,
      time: session.time,
      description: session.description,
      maxPlayers: session.maxPlayers,
      skillsLvl: session.skillsLvl,
      status: session.status,
      players: session.players.map(async (player) => {
        const userSkills = (await (player.user.skills ?? [])).find(
          (skill) => skill.boardGameName === session.boardGame.nameBoardGame
        );
  
        return {
          id: player.id,
          idUser: player.user.id,
          name: player.user.nickname,
          avatar: player.user.mainPhoto || '',
          skillLvl: userSkills ? userSkills.skillLvl : 0,
          position: player?.result || null, 
          score: player?.score || null, 
        };
      }),
      organizer: {
        id: session.organizer.id,
        name: session.organizer.nickname,
        avatar: session.organizer.mainPhoto || "",
      },
      boardGame: session.boardGame.nameBoardGame,
      customTags: session.customTags.map((tag) => tag.nameTag),
    }));
  }


  
  async reportsEvents() {
    const sessions = await this.sessionRepository.find({ relations: ['organizer', 'players', 'boardGame', 'historyGames', 'customTags'] });
    
    if (!sessions) {
      throw new NotFoundException('sessions not found');
    }
    const allStatuses: EventStatus[] = ['created', 'searching', 'found', 'confirmed', 'in_progress', 'completed', 'canceled'];
    const statusReports  = allStatuses.map((status) => ({
        status,
        count: sessions.filter((s) => s.status === status).length,
    }))

    const gameMap: Record<string, number> = {};
    for (const session of sessions) {
      const gameName = session.boardGame?.nameBoardGame || 'Unknown';
      gameMap[gameName] = (gameMap[gameName] || 0) + 1;
    }
    const gameReports = Object.entries(gameMap).map(([gameName, count]) => ({
      gameName,
      count,
    }));

    const monthlyMap: Record<string, { created: number; completed: number; canceled: number }> = {};

    for (const session of sessions) {
      const month = session.date.slice(0, 7); // формат: "YYYY-MM"
  
      if (!monthlyMap[month]) {
        monthlyMap[month] = { created: 0, completed: 0, canceled: 0 };
      }
  
      monthlyMap[month].created += 1;
  
      if (session.status === 'completed') {
        monthlyMap[month].completed += 1;
      } else if (session.status === 'canceled') {
        monthlyMap[month].canceled += 1;
      }
    }
  
    const monthlyReports = Object.entries(monthlyMap).map(([month, stats]) => ({
      month,
      ...stats,
    }));

      // eventsByStatus
    const eventsByStatus: Record<EventStatus, Session[]> = {
      created: [],
      searching: [],
      found: [],
      confirmed: [],
      in_progress: [],
      completed: [],
      canceled: [],
    };

    for (const session of sessions) {
      eventsByStatus[session.status as EventStatus].push(session);
    }
    console.log(eventsByStatus);
    return {
      statusReports,
      gameReports,
      monthlyReports,
      eventsByStatus,
    };
  }

  async findAlll(): Promise<Session[]> {
    return this.sessionRepository.find({ relations: ['organizer', 'players', 'boardGame', 'historyGames', 'customTags']},
    );
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({ where: { id }, relations: ['organizer', 'players', 'boardGame', 'historyGames', 'customTags'] });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    
    return session;
  }

  async findOneById(id: string) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: [
        'organizer',
        'players',
        'players.user',
        'players.user.skills',
        'boardGame',
        'historyGames',
        'historyGames.players',
        'customTags',
      ],
    });
  
    if (!session) {
      throw new NotFoundException('Session not found');
    }
  
    return {
      id: session.id,
      sessionName: session.sessionName,
      place: session.place,
      date: session.date,
      time: session.time,
      description: session.description,
      maxPlayers: session.maxPlayers,
      skillsLvl: session.skillsLvl,
      status: session.status,
      players: session.players.map((player) => {
        const userSkills = player.user.skills?.find(
          (skill) => skill.boardGameName === session.boardGame.nameBoardGame
        );
  
        return {
          id: player.id,
          idUser: player.user.id,
          name: player.user.nickname,
          avatar: player.user.mainPhoto || '',
          skillLvl: userSkills ? userSkills.skillLvl : 0,
          position: player?.result || null, 
          score: player?.score || null, 
          namePlayer: player?.namePlayer || null,
          phoneNumber: player?.phoneNumber || null,

        };
      }),
      organizer: {
        id: session.organizer.id,
        nickname: session.organizer.nickname,
        avatar: session.organizer.mainPhoto || '',
      },
      boardGame: session.boardGame.nameBoardGame,
      customTags: session.customTags.map((tag) => ({
        id: tag.id,
        nameTag: tag.nameTag,
      })),
    };
  }
  
// В SessionService
async updateStatus(id: string, payload: { status: string; cancellationReason: string }) {

  const session = await this.sessionRepository.findOne({
    where: { id },
    relations: ['players', 'players.user', 'organizer'],
  });

  if (!session) {
    throw new NotFoundException(`Сессия с ID ${id} не найдена`);
  }

  if (payload.status !== undefined) {
    session.status = payload.status;
  }

  if (payload.cancellationReason !== undefined) {
    session.status = payload.cancellationReason;
  }

  await this.sessionRepository.save(session);

  const updatedSession = await this.sessionRepository.findOne({
    where: { id },
    relations: ['players', 'players.user', 'organizer', 'boardGame', 'historyGames', 'customTags'],
  });

  // Уведомляем участников
  const usersToNotify = [
    session.organizer,
    ...session.players.map(p => p.user),
  ].filter((u): u is Users => !!u?.telegramId); // только у кого есть telegramId
  console.log(usersToNotify);
  await Promise.all(
    usersToNotify.map(user =>
      this.telegramBotService.sendMessage(
        user.telegramId as string,
        `Статус сессии "${session.sessionName}" обновлён: ${session.status}`
      )
    )
  );

  return updatedSession;
}

  
  async update(id: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.sessionRepository.findOne({ where: { id } });
  
    if (!session) {
      throw new NotFoundException(`Сессия с ID ${id} не найдена`);
    }
  
    // Обновляем только те поля, которые переданы
    if (updateSessionDto.sessionName !== undefined) {
      session.sessionName = updateSessionDto.sessionName;
    }
    if (updateSessionDto.city !== undefined) {
      session.place = updateSessionDto.city;
    }
    if (updateSessionDto.place !== undefined) {
      session.place = updateSessionDto.place;
    }
    if (updateSessionDto.date !== undefined) {
      session.date = updateSessionDto.date;
    }
    if (updateSessionDto.time !== undefined) {
      session.time = updateSessionDto.time;
    }
    if (updateSessionDto.description !== undefined) {
      session.description = updateSessionDto.description;
    }
    if (updateSessionDto.maxPlayers !== undefined) {
      session.maxPlayers = updateSessionDto.maxPlayers;
    }
    if (updateSessionDto.skillsLvl !== undefined) {
      session.skillsLvl = updateSessionDto.skillsLvl;
    }
    if(updateSessionDto.status !== undefined) {
      session.status = updateSessionDto.status;
    }
  
    // Сохраняем обновленную сущность
    await this.sessionRepository.save(session);
  
    // Возвращаем обновленную сессию с отношениями
    return this.sessionRepository.findOne({
      where: { id },
      relations: ['players', 'organizer', 'boardGame', 'historyGames', 'customTags'],
    });
  }
  

  async remove(id: string): Promise<void> {
    const result = await this.sessionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Session not found');
    }
  }

  async findMySessions(userId: string, status?: string, sessionName?: string, date?: string) {
    status = status || "all";
  
    const query = this.sessionRepository
      .createQueryBuilder("session")
      .leftJoinAndSelect("session.players", "player")
      .leftJoinAndSelect("player.user", "user")
      .leftJoinAndSelect("user.skills", "skill")
      .leftJoinAndSelect("session.organizer", "organizer")
      .leftJoinAndSelect("session.boardGame", "boardGame")
      .leftJoinAndSelect("session.customTags", "customTag")
      .leftJoin("session.historyGames", "historyGame") // Добавляем связь с HistoryGame
      .addSelect("historyGame.result", "historyResult") // Берем result из истории игр
      .where("player.userId = :userId", { userId });
  
    if (sessionName) {
      query.andWhere("session.sessionName = :sessionName", { sessionName });
    }
  
    if (date) {
      query.andWhere("session.date = :date", { date });
    }
  
    const sessions = await query.getRawAndEntities();
  
    return sessions.entities.map((session, index) => ({
      id: session.id,
      sessionName: session.sessionName,
      place: session.place,
      date: session.date,
      time: session.time,
      description: session.description,
      maxPlayers: session.maxPlayers,
      skillsLvl: session.skillsLvl,
      status: session.status,
      result: sessions.raw[index]?.historyResult ?? null, // Добавляем result
      players: session.players.map((player) => {
        const userSkills = player.user.skills?.find(
          (skill) => skill.boardGameName === session.boardGame.nameBoardGame
        );
        return {
          id: player.id,
          idUser: player.user.id,
          name: player.user.nickname,
          avatar: player.user.mainPhoto || '',
          skillLvl: userSkills ? userSkills.skillLvl : 0,
          position: player?.result || null,
          score: player?.score || null,
        };
      }),
      organizer: {
        id: session.organizer.id,
        name: session.organizer.nickname,
        avatar: session.organizer.mainPhoto || "",
      },
      boardGame: session.boardGame.nameBoardGame,
      customTags: session.customTags.map((tag) => tag.nameTag),
    }));
  }
  
  

  async findMyCreatedSessions(userId: string, status?: string, sessionName?: string, date?: string) {
    const sessions = await this.sessionRepository.find({
      relations: ['organizer', 'players', 'players.user', 'players.user.skills', 'boardGame', 'customTags',         'historyGames',
        'historyGames.players',],
      where: {
        organizer: { id: userId },
        ...(sessionName ? { sessionName } : {}),
        ...(date ? { date } : {}),
      },
    });
    return sessions.map((session) => ({
      id: session.id,
      sessionName: session.sessionName,
      place: session.place,
      date: session.date,
      time: session.time,
      description: session.description,
      maxPlayers: session.maxPlayers,
      skillsLvl: session.skillsLvl,
      status: session.status,
      players: session.players.map(async (player) => {
        const userSkills = (await (player.user.skills ?? [])).find(
          (skill) => skill.boardGameName === session.boardGame.nameBoardGame
        );
  
        return {
          id: player.id,
          idUser: player.user.id,
          name: player.user.nickname,
          avatar: player.user.mainPhoto || '',
          skillLvl: userSkills ? userSkills.skillLvl : 0,
          position: player?.result || null, 
          score: player?.score || null, 
        };
      }),
      organizer: {
        id: session.organizer.id,
        name: session.organizer.nickname,
        avatar: session.organizer.mainPhoto || "",
      },
      boardGame: session.boardGame.nameBoardGame,
      customTags: session.customTags.map((tag) => tag.nameTag),
    }));
  }

  async removePlayer(participantId: string, idUser: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: participantId },
      relations: ['players', 'players.user', 'players.historyGame'],
    });
  
    if (!session) {
      throw new Error('Сессия не найдена');
    }
  
    // Фильтруем игроков, оставляя только тех, кто не соответствует `idUser`
    const playersToRemove = session.players.filter(player => player.user.id === idUser);
  
    if (playersToRemove.length === 0) {
      throw new Error('Игрок не найден в сессии');
    }
  
    // Удаляем игрока из всех историй
    for (const player of playersToRemove) {
      if (player.historyGame) {
        await this.playersRepository.delete(player.id); // Удаление из таблицы Players
      }
    }
  
    // Удаляем игрока из списка игроков сессии
    session.players = session.players.filter(player => player.user.id !== idUser);
  
    await this.sessionRepository.save(session);
  }
}
