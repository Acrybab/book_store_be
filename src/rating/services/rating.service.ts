import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from '../entities/rating.entities';
import { Repository } from 'typeorm';
import { User } from 'src/core/users/user.entities';
import { Book } from 'src/book/entities/book.entities';
import { CreateRatingDto } from '../dtos/rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async ratingBook(creatRatingDTO: CreateRatingDto) {
    const user = await this.userRepository.findOne({ where: { id: creatRatingDTO.userId } });
    const book = await this.bookRepository.findOne({ where: { id: creatRatingDTO.bookId } });
    if (!user || !book) {
      throw new Error('User or Book not found');
    }

    const newRating = this.ratingRepository.create({
      user: user,
      book: book,
      score: creatRatingDTO.rating,
      comment: creatRatingDTO.comment,
    });
    const savedRating = await this.ratingRepository.save(newRating);

    return {
      savedRating,
    };
  }

  async updateRatingBook(ratingId: number, updateRating: Partial<Rating>) {
    const updatdingRating = await this.ratingRepository.findOne({ where: { id: ratingId } });

    if (!updatdingRating) {
      throw new Error('Rating not found');
    }

    this.ratingRepository.merge(updatdingRating, updateRating);
    return await this.ratingRepository.save(updatdingRating);
  }

  async deleteRatingBook(ratingId: number) {
    const rating = await this.ratingRepository.findOne({ where: { id: ratingId } });
    if (!rating) {
      throw new Error('Rating not found');
    }
    await this.ratingRepository.remove(rating);
  }

  async getRatingsByBook(bookId: number) {
    const ratings = await this.ratingRepository.find({ where: { book: { id: bookId } } });
    return {
      data: ratings,
      message: 'Ratings retrieved successfully',
    };
  }
}
