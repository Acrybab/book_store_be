import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookService } from 'src/book/service/book.service';
import { UserService } from 'src/core/users/user.service';
import { Review } from '../entities/review.entities';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async makeReview(userId: number, bookId: number, comment: string, rating: number) {
    const user = await this.userService.findById(userId);

    const book = await this.bookService.findBookById(bookId);
    if (!user || !book) {
      throw new Error('User or Book not found');
    }
    const review = this.reviewRepository.create({
      comment,
      rating,
      user,
      book,
    });
    return await this.reviewRepository.save(review);
  }
}
