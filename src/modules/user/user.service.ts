import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
import { BoardGame, HistoryGame, Players, Session, Skills, Users } from 'entity/some.entity';
import { Repository } from 'typeorm';
import * as argon from 'argon2';  
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from './dto/update-profile.dto';
  @Injectable()
  export class UserService {
    constructor(
      @InjectRepository(Users)
      private readonly usersRepository: Repository<Users>,
      @InjectRepository(Skills)
      private readonly skillsRepo: Repository<Skills>,
      @InjectRepository(Players)
      private readonly playersRepo: Repository<Players>,
      @InjectRepository(HistoryGame)
      private readonly historyRepo: Repository<HistoryGame>,
      @InjectRepository(Session)
      private readonly sessionsRepo: Repository<Session>,
      @InjectRepository(BoardGame)
      private readonly boardGamesRepo: Repository<BoardGame>,
      @Inject(JwtService) private readonly jwtService: JwtService
    ) {}
  
    // Работа с профилем

    async getProfile(userId: string) {
      let user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        const player = await this.playersRepo.findOne({ where: { id: userId } });
        if (!player) throw new Error('User not found');
        userId = player?.user?.id;
        user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error('User not found');
      }
    
      const [skills, players, sessions, submittedGames] = await Promise.all([
        this.skillsRepo.find({ where: { user: { id: userId } } }),
        this.playersRepo.find({
          where: { user: { id: userId } },
          relations: ['session', 'historyGame'],
        }),
        this.sessionsRepo.find({
          where: { organizer: { id: userId } },
          relations: ['players', 'boardGame', 'customTags'],
        }),
        this.boardGamesRepo.find({ where: { creator: { id: userId } } }),
      ]);
    
      const totalGames = players?.length ?? 0;
      const wins = players?.filter((p) => p.result === 0)?.length ?? 0;
      const winRate = totalGames ? `${((wins / totalGames) * 100).toFixed(1)}%` : '0%';
      const avgPosition = totalGames ? players?.reduce((sum, p) => sum + (p.score ?? 0), 0) / totalGames : 0;
      
      return {
        id: user.id,
        username: user.nickname,
        email: user.email,
        avatar_url: user.mainPhoto ?? '',
        statusProfile: user.statusProfile,
        role: user.role,
        phone: players?.find((p) => p.phoneNumber)?.phoneNumber ?? '',
        games: skills?.map((skill) => ({
          id: skill.id,
          name: skill.boardGameName,
          mastery: skill.skillLvl,
        })) ?? [],
        tags: [],
        stats: { totalGames, wins, winRate, avgPosition },
        gameHistory: players
        ?.filter((p) => p.historyGame)
        ?.map((p) => ({
          id: p.id,
          idSession: p?.session?.id ?? '',
          title: p.session?.sessionName ?? '',
          date: p.session?.date ?? '',
          totalPlayers: p.session?.players?.length ?? 0,
          boardGameName: p.session?.boardGame?.nameBoardGame ?? '',
          result: p.result,
          hasNoResults: p?.session?.historyGames
        })) ?? [],
      
        hostedGames: sessions?.map((s) => ({
          id: s.id,
          title: s.sessionName,
          date: s.date,
          participants: s.players?.length ?? 0,
          status: new Date(s.date) > new Date() ? 'active' : 'completed',
          game: s.boardGame?.nameBoardGame ?? '',
          place: s.place,
          time: s.time,
          description: s.description,
          maxPlayers: s.maxPlayers,
          skillsLvl: s.skillsLvl,
          customTags: s.customTags?.map((tag) => ({ id: tag.id, nameTag: tag.nameTag })) ?? [],
        })) ?? [],
        submittedGames: submittedGames?.map((game) => ({
          id: game.id,
          nameBoardGame: game.nameBoardGame,
          status: game.status,
          createdAt: game.createdAt?.toISOString() ?? '',
        })) ?? [],
        loading: false,
        error: null,
        updateSuccess: false,
        viewedProfile: null,
      };
    }
    
    async updateProfile(userId: string, profileData: UpdateProfileDto) {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
  
      if (profileData.username) user.nickname = profileData.username;
      if (profileData.email) user.email = profileData.email;
      if (profileData.avatar_url) user.mainPhoto = profileData.avatar_url;
      if (profileData.statusProfile) user.statusProfile = profileData.statusProfile;
      if (profileData.role) user.role = profileData.role;
  
      await this.usersRepository.save(user);
  
      if (profileData.phone) {
        let player = await this.playersRepo.findOne({ where: { user: { id: userId } } });
        if (player) {
          player.phoneNumber = profileData.phone;
          await this.playersRepo.save(player);
        }
      }
  
      if (profileData.games) {
        await this.skillsRepo.delete({ user: { id: userId } });
        const newSkills = profileData.games.map((game) =>
          this.skillsRepo.create({
            user: { id: userId },
            boardGameName: game.name,
            skillLvl: game.mastery,
          }),
        );
        await this.skillsRepo.save(newSkills);
      }
  
      return { message: 'Profile updated successfully' };
    }

    async addGameToProfile(userId: string, gameData: { nameBoardGame: string; mastery: number }) {
      const user = await this.usersRepository.findOne({ 
        where: { id: userId }, 
        relations: ['skills'] 
      });
    
      if (!user) {
        throw new Error('Пользователь не найден');
      }
    
      // Дожидаемся загрузки списка навыков
      const userSkills = await user.skills;
    
      // Проверяем, есть ли уже такая игра у пользователя
      const existingSkill = userSkills.find(skill => skill.boardGameName === gameData.nameBoardGame);
    
      if (existingSkill) {
        existingSkill.skillLvl = gameData.mastery;
        return this.skillsRepo.save(existingSkill);
      }
    
      // Если игры нет, создаем новую запись
      const newSkill = this.skillsRepo.create({
        boardGameName: gameData.nameBoardGame,
        skillLvl: gameData.mastery,
        skillPercent: gameData.mastery + '%',
        user,
      });
    
      return this.skillsRepo.save(newSkill);
    }

    async removeGameFromProfile(userId: string, skillsId: string) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['skills'],
      });
      if (!user) {
        throw new Error('Пользователь не найден');
      }
    
      // Дожидаемся загрузки списка навыков
      const userSkills = await user.skills;
      console.log(userSkills);
      const skillToRemove = userSkills.find(skill => skill.id == skillsId);
    
      if (!skillToRemove) {
        throw new Error('Игра не найдена в профиле');
      }
    
      // Удаляем игру из списка навыков
      await this.skillsRepo.remove(skillToRemove);
    
      return { message: 'Игра успешно удалена из профиля' };
    }
    
    async updateGameMastery(userId: string, skillsId: string, mastery: number) {
      const user = await this.usersRepository.findOne({ 
        where: { id: userId }, 
        relations: ['skills'] 
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }
      const userSkills = await user.skills;
      const existingSkill = userSkills.find(skill => skill.id === skillsId);

      if (existingSkill) {
        existingSkill.skillLvl = mastery;
        return this.skillsRepo.save(existingSkill);
      }
      else {
        throw new NotFoundException('Навык не найден');
      }
    }
    
    // --------
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
    async createUser(userData: Partial<Users>) {
      if (!userData.hashPassword) {
        throw new BadRequestException('Password is required');
      }
    
      // Проверяем, существует ли пользователь с таким email или ником
      const existingUser = await this.usersRepository.findOne({
        where: [{ email: userData.email }, { nickname: userData.nickname }],
      });
    
      if (existingUser) {
        throw new BadRequestException(
          `Пользователь с таким ${existingUser.email === userData.email ? 'email' : 'ником'} уже существует`,
        );
      }
    
      // Хешируем пароль
      userData.hashPassword = await argon.hash(userData.hashPassword);
    
      // Создаём пользователя
      const user = this.usersRepository.create(userData);
    
      // Сохраняем пользователя в БД
      const savedUser = await this.usersRepository.save(user);
    
      // Генерируем JWT токен
      const token = this.jwtService.sign(
        { id: savedUser.id, role: savedUser.role, status: savedUser.statusProfile },
        { secret: process.env.JWT_SECRET },
      );
    
      return { user: savedUser, token };
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
  