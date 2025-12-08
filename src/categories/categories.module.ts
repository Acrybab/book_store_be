import { Module } from '@nestjs/common';
import { CategoriesService } from './services/catories.service';
import { CategoriesController } from './controller/categories.controller';
import { Category } from './entities/categories.entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
