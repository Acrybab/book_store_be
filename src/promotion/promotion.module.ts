import { Module } from '@nestjs/common';
import { PromotionController } from './controllers/promotion.controller';
import { PromotionService } from './services/promotion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entities';
import { UserService } from 'src/core/users/user.service';
import { SupabaseService } from 'src/book/service/supabase.service';
import { User } from 'src/core/users/user.entities';
import { BookService } from 'src/book/service/book.service';
import { Book } from 'src/book/entities/book.entities';
import { FavoriteBook } from 'src/book/entities/favoriteBook.entities';
import { Cart } from 'src/book/entities/cart.entities';
import { Category } from 'src/categories/entities/categories.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, User, Book, FavoriteBook, Cart, Category])],
  controllers: [PromotionController],
  providers: [PromotionService, UserService, SupabaseService, BookService],
})
export class PromotionModule {}
