import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entities';
import { User } from 'src/core/users/user.entities';
import { Book } from 'src/book/entities/book.entities';
import { RatingService } from './services/rating.service';
import { RatingController } from './controllers/rating.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, User, Book])],
  controllers: [RatingController],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
