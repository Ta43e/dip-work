import { Injectable, NotFoundException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardGame, Players, Session, Users } from 'entity/some.entity';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UUID } from 'crypto';
import { console } from 'inspector';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    @InjectRepository(BoardGame) private readonly boardGameRepository: Repository<BoardGame>,
    @InjectRepository(Session) private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Players) private readonly playersRepository: Repository<Players>,
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
    console.log(userId);
    return sessions.map((session) => ({
      id: session.id,
      sessionName: session.sessionName,
      place: session.place,
      date: session.date,
      time: session.time,
      description: session.description,
      maxPlayers: session.maxPlayers,
      skillsLvl: session.skillsLvl,
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
