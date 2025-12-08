import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CategoriesService } from '../services/catories.service';
import { CreateCategoryDto } from '../dto/catories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() category: Partial<CreateCategoryDto>) {
    return await this.categoriesService.createCategory({
      //   bookId: category.bookId,
      //   books: category.books,
      name: category.name,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() category: Partial<CreateCategoryDto>) {
    return await this.categoriesService.updateCategory(id, category);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.categoriesService.deleteCategory(id);
  }
}
