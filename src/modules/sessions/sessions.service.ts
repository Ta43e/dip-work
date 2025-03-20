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
    const { game, ...sessionData } = createSessionDto;
    sessionData.skillsLvl = +sessionData.skillsLvl;
    const id = "295d6bfb-0bcc-4151-acb9-af3fa6fc8c04";
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
      relations: ['organizer', 'players', 'players.user', 'players.user.skills', 'boardGame', 'customTags'],
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
          id: player.user.id,
          name: player.user.nickname,
          avatar: player.user.mainPhoto || "",
          skillLvl: userSkills ? userSkills.skillLvl : 0, // Если скилла нет, передаем 0
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

  async findOneById(id: string){
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['organizer', 'players', 'players.user', 'players.user.skills', 'boardGame', 'historyGames', 'customTags'],
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
      players: await Promise.all(
        session.players.map(async (player) => {
          const userSkills = (await player.user.skills) // Ждём загрузки skills
            ?.find((skill) => skill.boardGameName === session.boardGame.nameBoardGame);
  
          return {
            id: player.id,
            nickname: player.user.nickname,
            avatar: player.user.mainPhoto || "",
            skillLvl: userSkills ? userSkills.skillLvl : 0,
          };
        })
      ),
      organizer: {
        id: session.organizer.id,
        nickname: session.organizer.nickname,
        avatar: session.organizer.mainPhoto || "",
      },
      boardGame: {
        id: session.boardGame.id,
        nameBoardGame: session.boardGame.nameBoardGame,
      },
      customTags: session.customTags.map((tag) => ({
        id: tag.id,
        nameTag: tag.nameTag,
      })),
    };
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

  async findMySessions(userId: string, status?: string, sessionName?: string, date?: string): Promise<Session[]> {
    status = !status ? "all" : status;
    console.log(status);
    const query = this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.players', 'player')
      .where('player.userId = :userId', { userId });

    if (sessionName) {
      query.andWhere('session.sessionName = :sessionName', { sessionName });
    }

    if (date) {
      query.andWhere('session.date = :date', { date });
    }


    return query.getMany();
  }
}
