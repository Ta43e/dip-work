import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category, TagsForCategory } from 'entity/some.entity';
import { In, Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-categories.dto';
import { FilterDto } from './dto/filter-categories.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(TagsForCategory)
    private readonly tagsRepository: Repository<TagsForCategory>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
        let tags: TagsForCategory[] = [];

        if (dto.tags && dto.tags.length > 0) {
            // Ищем существующие теги по именам
            const existingTags = await this.tagsRepository.find({
                where: { nameTag: In(dto.tags) },
            });

            // Массив имен существующих тегов
            const existingTagNames = existingTags.map(tag => tag.nameTag);

            // Находим новые теги, которых нет среди существующих
            const newTagNames = dto.tags.filter(tag => !existingTagNames.includes(tag));

            let newTags: TagsForCategory[] = [];
            if (newTagNames.length > 0) {
                // Создаем новые теги и сохраняем их в базе
                newTags = this.tagsRepository.create(
                    newTagNames.map(nameTag => ({ nameTag }))
                );
                await this.tagsRepository.save(newTags);
            }

            tags = [...existingTags, ...newTags];
        }

        console.log('Теги перед сохранением категории:', tags);

        // Создаем категорию БЕЗ тегов
        const category = this.categoryRepository.create({...dto, tags});

        // Сначала сохраняем категорию
        const savedCategory = await this.categoryRepository.save(category);

        if (tags.length > 0) {
            // Привязываем теги и обновляем
            savedCategory.tags = tags;
            await this.categoryRepository.save(savedCategory);
        }
        console.log(savedCategory);
        return savedCategory;
    } catch (e) {
        console.error(e);
        throw new ExceptionsHandler(e);
    }
}




  async findAll(filters: FilterDto): Promise<Category[]> {
  
    if (typeof filters.selectedTags === "string") {
      filters.selectedTags = [filters.selectedTags];
    }
  
    // Получаем общее число игр
    const totalGamesCount = await this.categoryRepository
      .createQueryBuilder("category")
      .leftJoin("category.boardGames", "boardGames")
      .select("COUNT(DISTINCT boardGames.id)", "count")
      .getRawOne();
  
    const totalGames = Number(totalGamesCount.count) || 1; // Защита от деления на 0
  
    const query = this.categoryRepository.createQueryBuilder("category")
    .leftJoin("category.boardGames", "boardGames")
    .leftJoin("category.tags", "tags")
    .loadRelationCountAndMap("category.gamesCount", "category.boardGames")
    .addSelect(`COUNT(DISTINCT boardGames.id) * 100.0 / :totalGames`, "popularityPercentage")
    .addSelect(`JSON_AGG(DISTINCT jsonb_build_object('id', tags.id, 'nameTag', tags.nameTag))::TEXT`, "tags")
    .addSelect(`JSON_AGG(DISTINCT jsonb_build_object('id', boardGames.id, 'name', boardGames.nameBoardGame))::TEXT`, "games") // Приводим к строке
    .setParameter("totalGames", totalGames)
    .groupBy("category.id");

if (filters.searchQuery) {
  query.andWhere("category.nameCategory ILIKE :searchQuery", { searchQuery: `%${filters.searchQuery}%` });
}

// if (filters.selectedCategory && filters.selectedCategory !== "Все") {
//   query.andWhere("category.nameCategory = :selectedCategory", { selectedCategory: filters.selectedCategory });
// }

if (filters.selectedTags && filters.selectedTags.length) {
  query.andWhere("tags.nameTag IN (:...selectedTags)", { selectedTags: filters.selectedTags });
}

// Фильтруем по популярности
query.having("COUNT(DISTINCT boardGames.id) * 100.0 / :totalGames >= :minPopularity", { minPopularity: 0 });

query.orderBy("COUNT(DISTINCT boardGames.id) * 100.0 / :totalGames", "DESC");

const categories = await query.getRawAndEntities();

// Парсим JSON-агрегированные данные
return categories.entities.map((category, index) => ({
  ...category,
  popularityPercentage: parseFloat(categories.raw[index].popularityPercentage),
  tags: typeof categories.raw[index].tags === "string"
    ? JSON.parse(categories.raw[index].tags)
    : categories.raw[index].tags || [],
    boardGames: typeof categories.raw[index].games === "string"
    ? JSON.parse(categories.raw[index].games)
    : categories.raw[index].games || [],
}));

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
