import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category, TagsForCategory } from 'entity/some.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-categories.dto';
import { FilterDto } from './dto/filter-categories.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(TagsForCategory)
    private readonly tagsRepository: Repository<TagsForCategory>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const tags = dto.tags ? await this.tagsRepository.findByIds(dto.tags) : [];

    const category = this.categoryRepository.create({
      ...dto,
      tags,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(filters: FilterDto): Promise<Category[]> {
    const query = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.tags', 'tags')
      .leftJoinAndSelect('category.boardGames', 'boardGames');

    if (filters.searchQuery) {
      query.andWhere('category.nameCategory ILIKE :searchQuery', { searchQuery: `%${filters.searchQuery}%` });
    }
    if (filters.selectedCategory && filters.selectedCategory !== 'Все') {
      query.andWhere('category.nameCategory = :selectedCategory', { selectedCategory: filters.selectedCategory });
    }
    if (filters.selectedTags && filters.selectedTags.length) {
      query.andWhere('tags.nameTag IN (:...selectedTags)', { selectedTags: filters.selectedTags });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['tags', 'boardGames'],
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.tags) {
      category.tags = await this.tagsRepository.findByIds(dto.tags);
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}
