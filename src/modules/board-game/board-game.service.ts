import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardGame, Category, TagsForBoardGame, TagsForCategory } from 'entity/some.entity';
import { In, Repository } from 'typeorm';
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

  async create(dto: CreateBoardGameDto) {
    const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');
  
    const tags = dto.tags ? await this.tagsRepository.findByIds(dto.tags) : [];
  
    const boardGame = this.boardGameRepository.create({ ...dto, category, tags });
    const savedBoardGame = await this.boardGameRepository.save(boardGame);
  
    // Возвращаем объект без вложенного category, а только с именем категории
    return { 
      ...savedBoardGame, 
      category: savedBoardGame.category.nameCategory
    };
  }

  async findAll() {
    const games = await this.boardGameRepository.find({
      relations: ['category', 'tags'],
    });
  
    return games.map((game) => ({
      ...game,
      category: (game.category as Category)?.nameCategory,
    }));
  }
  

  async findOne(id: string): Promise<BoardGame> {
    const boardGame = await this.boardGameRepository.findOne({ where: { id }, relations: ['category', 'tags'] });
    if (!boardGame) throw new NotFoundException('Board game not found');
    return boardGame;
  }

  async update(id: string, dto: UpdateBoardGameDto){
    const boardGame = await this.findOne(id);
    console.log("ffffffffffffff" + dto.category);
    if (!boardGame) {
        throw new NotFoundException("Настольная игра не найдена");
    }
    
    // Обновляем только переданные поля
    if (dto.nameBoardGame !== undefined) {
      boardGame.nameBoardGame = dto.nameBoardGame;
    }

    if (dto.equipment !== undefined) {
      boardGame.equipment = dto.equipment;
    }

    if (dto.minPlayers !== undefined) {
      boardGame.minPlayers = dto.minPlayers;
    }

    if (dto.maxPlayers !== undefined) {
      boardGame.maxPlayers = dto.maxPlayers;
    }

    if (dto.description !== undefined) {
      boardGame.description = dto.description;
    }

    if (dto.age !== undefined) {
      boardGame.age = dto.age;
    }

    if (dto.boardGameImage !== undefined) {
      boardGame.boardGameImage = dto.boardGameImage;
    }

    if (dto.rules !== undefined) {
      boardGame.rules = dto.rules;
    }

    if (dto.category) {
      const category = await this.categoryRepository.findOne({ where: { nameCategory: dto.category } });
      if (!category) {
          throw new NotFoundException("Категория не найдена");
      }
  
      // Присваиваем boardGame.category найденный объект Category
      boardGame.category = category;
  }
    
    if (dto.tags) {
        // Если tags не переданы или пустой массив, удаляем все теги
        if (dto.tags.length === 0) {
            boardGame.tags = [];
            await this.boardGameRepository.save(boardGame);
            return boardGame;
        }

        // Ищем существующие теги
        const existingTags = await this.tagsRepository.find({
            where: { nameTag: In(dto.tags) },
        });

        // Определяем, какие теги нужно удалить
        const existingTagNames = existingTags.map(tag => tag.nameTag);
        boardGame.tags = boardGame.tags.filter(tag => dto?.tags?.includes(tag.nameTag));

        // Определяем новые теги
        const newTagNames = dto.tags.filter(tag => !existingTagNames.includes(tag));
        let newTags: TagsForBoardGame[] = [];
        if (newTagNames.length > 0) {
            newTags = this.tagsRepository.create(newTagNames.map(tagName => ({ nameTag: tagName })));
            await this.tagsRepository.save(newTags);
        }

        // Обновляем теги у настольной игры
        boardGame.tags = [...existingTags, ...newTags];
    }

    //Object.assign(boardGame, dto);
    await this.boardGameRepository.save(boardGame);

    // Проверяем обновлённые данные
    const updatedBoardGame = await this.boardGameRepository.findOne({
        where: { id },
        relations: ["tags", "category"],
    });

    return {
      ...updatedBoardGame,
      category: updatedBoardGame?.category.nameCategory
    };
}

  async remove(id: string): Promise<void> {
    const boardGame = await this.findOne(id);
    await this.boardGameRepository.remove(boardGame);
  }

  async removeTag(tagName: string): Promise<string> {
    const tag = await this.tagsRepository.findOne({
        where: { nameTag: tagName },
        relations: ['boardGames'],
    });

    if (!tag) {
        return `Тег "${tagName}" не найден.`;
    }

    for (const boardGame of tag.boardGames) {
        boardGame.tags = boardGame.tags.filter((t) => t.id !== tag.id);
    }

    await Promise.all(tag.boardGames.map((boardGame) => this.tagsRepository.manager.save(boardGame)));

    await this.tagsRepository.remove(tag);

    return `Тег "${tagName}" успешно удалён.`;
}

}