import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/categories.entities';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createCategory(category: Partial<Category>) {
    const newCategory = this.categoryRepository.create(category);
    return await this.categoryRepository.save(newCategory);
  }

  async updateCategory(id: string, category: Partial<Category>) {
    await this.categoryRepository.update(id, category);
    return this.categoryRepository.findOne({ where: { id: Number(id) } });
  }

  async deleteCategory(id: string) {
    await this.categoryRepository.delete(id);
  }
}
