import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookService } from 'src/book/service/book.service';
import { UserService } from 'src/core/users/user.service';
import { Review } from '../entities/review.entities';
import { Repository } from 'typeorm';
import { MakeReviewDTO } from '../dto/review.dto';
import { ReactReviewService } from './react_review.service';

@Injectable()
export class ReviewService {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly reactReviewService: ReactReviewService,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getReviewByBookId(bookId: number) {
    const review = await this.reviewRepository.find({ where: { book: { id: bookId } }, relations: ['user', 'book'] });
    if (review.length === 0) {
      return {
        message: 'No reviews found for this book',
        data: [],
      };
    }
    return {
      message: 'Reviews retrieved successfully',
      data: review,
    };
  }

  async makeReview(userId: number, makeReviewDTO: MakeReviewDTO) {
    const user = await this.userService.findById(userId);

    const book = await this.bookService.findBookById(makeReviewDTO.bookId);

    if (!user || !book) {
      return {
        message: 'User or Book not found',
      };
    }
    const review = this.reviewRepository.create({
      comment: makeReviewDTO.comment,
      rating: makeReviewDTO.rating,
      user,
      book,
    });
    return await this.reviewRepository.save(review);
  }
  async getAllReviews() {
    const reviews = await this.reviewRepository.find({ relations: ['user', 'book'] });
    if (reviews.length === 0) {
      return {
        message: 'No reviews found',
        data: [],
      };
    }
    return {
      message: 'Reviews retrieved successfully',
      data: reviews,
    };
  }

  async updateReview(reviewId: number, makeReviewDTO: MakeReviewDTO) {
    const review = await this.reviewRepository.findOne({ where: { reviewId: reviewId } });
    if (!review) {
      return {
        message: 'Review not found',
      };
    }
    review.comment = makeReviewDTO.comment || review.comment;
    review.rating = makeReviewDTO.rating || review.rating;

    return await this.reviewRepository.save(review);
  }

  async deleteReview(reviewId: number) {
    const review = await this.reviewRepository.findOne({ where: { reviewId: reviewId } });
    if (!review) {
      return {
        message: 'Review not found',
      };
    }
    await this.reviewRepository.remove(review);
    return {
      message: 'Review deleted successfully',
    };
  }
}
