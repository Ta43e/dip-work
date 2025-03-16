import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category, TagsForCategory } from 'entity/some.entity';
import { In, Repository } from 'typeorm';
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
    console.log(dto);
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
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["tags"], // Загружаем связанные теги
    });
  
    if (!category) throw new Error("Категория не найдена");
  
    // Обновляем только переданные поля
    if (dto.nameCategory !== undefined) {
      category.nameCategory = dto.nameCategory;
    }
  
    if (dto.categoryImage !== undefined) {
      category.categoryImage = dto.categoryImage;
    }
  
    if (dto.description !== undefined) {
      category.description = dto.description;
    }
  
    // Если tags не переданы или пустой массив, удаляем все теги
    if (!dto.tags || dto.tags.length === 0) {
      category.tags = [];
      await this.categoryRepository.save(category);
      console.log("Все теги удалены");
      return category;
    }
  
    // Ищем существующие теги
    const existingTags = await this.tagsRepository.find({
      where: { nameTag: In(dto.tags) },
    });
  
    // Определяем, какие теги нужно удалить (которых больше нет в dto.tags)
    const existingTagNames = existingTags.map(tag => tag.nameTag);
    const removedTags = category.tags.filter(tag => !dto?.tags?.includes(tag.nameTag));
  
    if (removedTags.length > 0) {
      category.tags = category.tags.filter(tag => dto?.tags?.includes(tag.nameTag));
    }
  
    // Определяем новые теги
    const newTagNames = dto.tags.filter(tag => !existingTagNames.includes(tag));
  
    let newTags: TagsForCategory[] = [];
    if (newTagNames.length > 0) {
      newTags = this.tagsRepository.create(newTagNames.map(tagName => ({ nameTag: tagName })));
      await this.tagsRepository.save(newTags);
    }
  
    // Обновляем теги у категории
    category.tags = [...existingTags, ...newTags];
  
    await this.categoryRepository.save(category);
  
    // Проверяем, что всё сохранилось
    const updatedCategory = await this.categoryRepository.findOne({
      where: { id },
      relations: ["tags"],
    });
  
    console.log("Обновлённая категория:", updatedCategory);
    return updatedCategory!;
  }
  
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async addTagToCategory(tagName: string): Promise<TagsForCategory | string> {
    const existingTag = await this.tagsRepository.findOne({ where: { nameTag: tagName } });

    if (existingTag) {
        return `Тег "${tagName}" уже существует.`;
    }

    const newTag = this.tagsRepository.create({ nameTag: tagName });

    return await this.tagsRepository.save(newTag);
  }

  async removeTag(tagName: string): Promise<string> {
    const tag = await this.tagsRepository.findOne({
        where: { nameTag: tagName },
        relations: ['categories'],
    });

    if (!tag) {
        return `Тег "${tagName}" не найден.`;
    }

    for (const category of tag.categories) {
        category.tags = category.tags.filter((t) => t.id !== tag.id);
    }

    await Promise.all(tag.categories.map((category) => this.tagsRepository.manager.save(category)));

    await this.tagsRepository.remove(tag);

    return `Тег "${tagName}" успешно удалён.`;
  }


}
