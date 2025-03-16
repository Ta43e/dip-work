import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateTagForCategoryDto,
  UpdateTagForCategoryDto,
  CreateSkillDto,
  UpdateSkillDto,
  CreateCustomTagDto,
  UpdateCustomTagDto,
  CreateTagForBoardGameDto,
  UpdateTagForBoardGameDto,
} from './dto/entities.dto';
import { CustomTags, Session, Skills, TagsForBoardGame, TagsForCategory, Users } from 'entity/some.entity';

@Injectable()
export class EntitiesService {
  constructor(
    @InjectRepository(TagsForCategory)
    private readonly tagRepository: Repository<TagsForCategory>,

    @InjectRepository(Skills)
    private readonly skillsRepository: Repository<Skills>,

    @InjectRepository(CustomTags)
    private readonly customTagsRepository: Repository<CustomTags>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    
    @InjectRepository(TagsForBoardGame)
    private readonly tagsForBoardGameRepository: Repository<TagsForBoardGame>,
  ) {}

  async findAllTag() {
    return this.tagRepository.find();
  }
  // Теги категорий

  async addTagToCategory(tagName: string): Promise<TagsForCategory | string> {
    const existingTag = await this.tagRepository.findOne({ where: { nameTag: tagName } });

    if (existingTag) {
        return `Тег "${tagName}" уже существует.`;
    }

    const newTag = this.tagRepository.create({ nameTag: tagName });

    return await this.tagRepository.save(newTag);
  }

  async removeTag(id: string): Promise<string> {
    const tag = await this.tagRepository.findOne({
        where: { id: id },
        relations: ['categories'],
    });

    if (!tag) {
        return `Тег "${id}" не найден.`;
    }
    
    for (const category of tag.categories) {
        if(!category.tags) break;
        category.tags = category.tags.filter((t) => t.id !== tag.id);
    }

    await Promise.all(tag.categories.map((category) => this.tagRepository.manager.save(category)));

    await this.tagRepository.remove(tag);

    return `Тег "${id}" успешно удалён.`;
  }


  async updateTag(id: string, dto: UpdateTagForCategoryDto): Promise<TagsForCategory> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    Object.assign(tag, dto);
    return this.tagRepository.save(tag);
  }


  // Навыки

  async findAllSkill() {
    return this.skillsRepository.find();
  }

  async createSkill(dto: CreateSkillDto): Promise<Skills> {
    const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const skill = this.skillsRepository.create({ ...dto, user });
    return this.skillsRepository.save(skill);
  }

  async updateSkill(id: string, dto: UpdateSkillDto): Promise<Skills> {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');

    Object.assign(skill, dto);
    return this.skillsRepository.save(skill);
  }

  async deleteSkill(id: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.skillsRepository.remove(skill);
  }

  // Кастомные теги

  async findAllCustomTag() {
    return this.customTagsRepository.find();
  }

  async createCustomTag(dto: CreateCustomTagDto): Promise<CustomTags> {
    const session = await this.sessionRepository.findOne({ where: { id: dto.sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const tag = this.customTagsRepository.create({ ...dto, session });
    return this.customTagsRepository.save(tag);
  }

  async updateCustomTag(id: string, dto: UpdateCustomTagDto): Promise<CustomTags> {
    const tag = await this.customTagsRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Custom tag not found');

    Object.assign(tag, dto);
    return this.customTagsRepository.save(tag);
  }

  async deleteCustomTag(id: string): Promise<void> {
    const tag = await this.customTagsRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Custom tag not found');
    await this.customTagsRepository.remove(tag);
  }
// теги для игр
async findAllTagForBoardGame() {
  return this.tagsForBoardGameRepository.find();
}

async addTagToBoardGame(tagName: string): Promise<TagsForBoardGame | string> {
  const existingTag = await this.tagsForBoardGameRepository.findOne({ where: { nameTag: tagName } });
  
  if (existingTag) {
      return `Тег "${tagName}" уже существует.`;
  }
  
  const newTag = this.tagsForBoardGameRepository.create({ nameTag: tagName });
  return await this.tagsForBoardGameRepository.save(newTag);
}

async removeTagForBoardGame(id: string): Promise<string> {
  const tag = await this.tagsForBoardGameRepository.findOne({
      where: { id: id },
      relations: ['boardGames'],
  });
  
  if (!tag) {
      return `Тег "${id}" не найден.`;
  }
  
  for (const boardGame of tag.boardGames) {
      if (!boardGame.tags) break;
      boardGame.tags = boardGame.tags.filter((t) => t.id !== tag.id);
  }
  
  await Promise.all(tag.boardGames.map((boardGame) => this.tagsForBoardGameRepository.manager.save(boardGame)));
  
  await this.tagsForBoardGameRepository.remove(tag);
  
  return `Тег "${id}" успешно удалён.`;
}

async updateTagForBoardGame(id: string, dto: UpdateTagForBoardGameDto): Promise<TagsForBoardGame> {
  const tag = await this.tagsForBoardGameRepository.findOne({ where: { id } });
  if (!tag) throw new NotFoundException('Tag for board game not found');
  
  Object.assign(tag, dto);
  return this.tagsForBoardGameRepository.save(tag);
}
}
