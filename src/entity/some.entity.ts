import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  nickname: string;

  @Column({ type: 'text' })
  hashPassword: string;

  @Column({ type: 'text', nullable: true })
  mainPhoto: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  statusProfile: string;

  @Column({
    type: 'enum',
    enum: ['USER', 'ADMIN', 'MODERATOR', 'ORGANIZER'],
    default: 'USER',
  })
  role: string;

  @OneToMany(() => Players, (player) => player.user, { cascade: true })
  players: Players[];

  @OneToMany(() => Session, (session) => session.organizer)
  sessions: InstanceType<typeof Session>[];

  @OneToMany(() => Skills, (skill) => skill.user, { cascade: true })
  skills: Skills[];

  @OneToMany(() => BoardGame, (boardGame) => boardGame.creator, { cascade: true })
  createdBoardGames: BoardGame[];
}

@Entity()
export class Players {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.players, { onDelete: 'CASCADE' })
  user: Users;

  @ManyToOne(() => Session, (session) => session.players, { onDelete: 'CASCADE' })
  session: Session;

  @Column({ type: 'int', nullable: true })
  result: number;

  @Column({ type: 'int', nullable: true })
  score: number;

  @ManyToOne(() => HistoryGame, (history) => history.players, { onDelete: 'SET NULL' })
  historyGame: HistoryGame | null; // Изменяем на HistoryGame | null

  @Column({ type: 'text', nullable: true })
  namePlayer: string;

  @Column({ type: 'text', nullable: true })
  phoneNumber: string;
}

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  sessionName: string;

  @Column({ type: 'varchar',  nullable: true  })
  city: string;

  @Column({ type: 'varchar' })
  place: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  maxPlayers: number;

  @Column({ type: 'int' })
  skillsLvl: number;

  @Column({
    type: 'enum',
    enum: ['created', 'searching', 'found', 'confirmed', 'in_progress', 'completed', 'canceled'],
    default: 'created',
  })
  status: String;

  @OneToMany(() => Players, (player) => player.session, { cascade: true })
  players: Players[];

  @ManyToOne(() => Users, (user) => user.sessions, { onDelete: 'CASCADE' })
  organizer: Users;

  @ManyToOne(() => BoardGame, (boardGame) => boardGame.sessions, {
    onDelete: 'CASCADE',
  })
  boardGame: BoardGame;

  @OneToMany(() => HistoryGame, (history) => history.session, { cascade: true })
  historyGames: HistoryGame[];

  @OneToMany(() => CustomTags, (customTag) => customTag.session, {
    cascade: true,
  })
  customTags: CustomTags[];
}

@Entity()
export class HistoryGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  result: number;

  @OneToMany(() => Players, (player) => player.historyGame)
  players: Players[];

  @ManyToOne(() => Session, (session) => session.historyGames, { onDelete: 'CASCADE' })
  session: Session;
}

@Entity()
export class BoardGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nameBoardGame: string;

  @Column({ type: 'text' })
  equipment: string;
  
  @Column({ type: 'text' })
  boardGameImage: string;

  @Column({ type: 'int' })
  minPlayers: number;

  @Column({ type: 'int' })
  maxPlayers: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'text' })
  rules: string;

  @ManyToOne(() => Category, { nullable: false, onDelete: 'CASCADE'  })
  category: Category;

  @OneToMany(() => Session, (session) => session.boardGame)
  sessions: Session[];

  @ManyToMany(() => TagsForBoardGame, (tag) => tag.boardGames)
  @JoinTable()
  tags: TagsForBoardGame[];

  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  creator: Users;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

@Entity()
export class TagsForBoardGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nameTag: string;

  @ManyToMany(() => BoardGame, (boardGame) => boardGame.tags)
  boardGames: BoardGame[];
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true  })
  nameCategory: string;

  @Column({ type: 'text' })
  categoryImage: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToMany(() => TagsForCategory, (tag) => tag.categories, { cascade: true })
  @JoinTable()
  tags: TagsForCategory[];

  @OneToMany(() => BoardGame, (boardGame) => boardGame.category)
  boardGames: BoardGame[];
}

@Entity()
export class TagsForCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nameTag: string;

  @ManyToMany(() => Category, (category) => category.tags)
  categories: Category[];
}

@Entity()
export class Skills {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  boardGameName: string;

  @Column({ type: 'int' })
  skillLvl: number;

  @Column({ type: 'varchar', length: 255 })
  skillPercent: string;

  @ManyToOne(() => Users, (user) => user.skills, { onDelete: 'CASCADE' })
  user: Users;
}

@Entity()
export class CustomTags {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Session, (session) => session.customTags, {
    onDelete: 'CASCADE',
  })
  session: Session;

  @Column({ type: 'varchar', length: 255 })
  nameTag: string;
}

@Entity()
export class PlayersGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

    @ManyToOne(() => Session, (session) => session.customTags, {
      onDelete: 'CASCADE',
    })
    session: Session;

  @Column({ type: 'varchar', length: 255 })
  nameTag: string;
}
