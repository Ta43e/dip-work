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
  async createTag(dto: CreateTagForCategoryDto): Promise<TagsForCategory> {
    const tag = this.tagRepository.create(dto);
    return this.tagRepository.save(tag);
  }

  async updateTag(id: string, dto: UpdateTagForCategoryDto): Promise<TagsForCategory> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    Object.assign(tag, dto);
    return this.tagRepository.save(tag);
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    await this.tagRepository.remove(tag);
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

  async createTagForBoardGame(dto: CreateTagForBoardGameDto): Promise<TagsForBoardGame> {
    const tag = this.tagsForBoardGameRepository.create(dto);
    return this.tagsForBoardGameRepository.save(tag);
  }

  async updateTagForBoardGame(id: string, dto: UpdateTagForBoardGameDto): Promise<TagsForBoardGame> {
    const tag = await this.tagsForBoardGameRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag for board game not found');

    Object.assign(tag, dto);
    return this.tagsForBoardGameRepository.save(tag);
  }

  async deleteTagForBoardGame(id: string): Promise<void> {
    const tag = await this.tagsForBoardGameRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag for board game not found');

    await this.tagsForBoardGameRepository.remove(tag);
  }
}
