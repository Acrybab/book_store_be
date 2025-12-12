import { Module } from '@nestjs/common';
import { ReviewService } from './services/review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entities';
import { ReviewImage } from './entities/review_images';
import { ReviewReaction } from './entities/review_reaction.entities';
import { Book } from 'src/book/entities/book.entities';
import { User } from 'src/core/users/user.entities';
import { BookService } from 'src/book/service/book.service';
import { UserService } from 'src/core/users/user.service';
import { ReviewController } from './controller/review.controller';
import { FavoriteBook } from 'src/book/entities/favoriteBook.entities';
import { Cart } from 'src/book/entities/cart.entities';
import { Category } from 'src/categories/entities/categories.entities';
import { SupabaseService } from 'src/book/service/supabase.service';
import { MailService } from 'src/common/services/mail.service';
import { ShippingAddress } from 'src/shippingAddress/entities/shippingAddress.entity';
import { ReactReviewService } from './services/react_review.service';
import { ReactReviewController } from './controller/react_review.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      ReviewImage,
      ReviewReaction,
      Book,
      User,
      FavoriteBook,
      Cart,
      Category,
      ShippingAddress,
    ]),
  ],
  providers: [ReviewService, BookService, UserService, SupabaseService, MailService, ReactReviewService],
  controllers: [ReviewController, ReactReviewController],
  exports: [],
})
export class ReviewModule {}
