import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardGame, Category, TagsForBoardGame } from 'entity/some.entity';
import { Repository } from 'typeorm';
import { CreateBoardGameDto, UpdateBoardGameDto } from './dto/create-board-game.dto';


@Injectable()
export class BoardGameService {
  constructor(
    @InjectRepository(BoardGame)
    private readonly boardGameRepository: Repository<BoardGame>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(TagsForBoardGame)
    private readonly tagsRepository: Repository<TagsForBoardGame>,
  ) {}

  async create(dto: CreateBoardGameDto): Promise<BoardGame> {
    const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const tags = dto.tags ? await this.tagsRepository.findByIds(dto.tags) : [];

    const boardGame = this.boardGameRepository.create({ ...dto, category, tags });
    return this.boardGameRepository.save(boardGame);
  }

  async findAll(): Promise<BoardGame[]> {
    return this.boardGameRepository.find({ relations: ['category', 'tags'] });
  }

  async findOne(id: string): Promise<BoardGame> {
    const boardGame = await this.boardGameRepository.findOne({ where: { id }, relations: ['category', 'tags'] });
    if (!boardGame) throw new NotFoundException('Board game not found');
    return boardGame;
  }

  async update(id: string, dto: UpdateBoardGameDto): Promise<BoardGame> {
    const boardGame = await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      boardGame.category = category;
    }

    if (dto.tags) {
      const tags = await this.tagsRepository.findByIds(dto.tags);
      boardGame.tags = tags;
    }

    Object.assign(boardGame, dto);
    return this.boardGameRepository.save(boardGame);
  }

  async remove(id: string): Promise<void> {
    const boardGame = await this.findOne(id);
    await this.boardGameRepository.remove(boardGame);
  }
}