/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookService } from 'src/book/service/book.service';
import { UserService } from 'src/core/users/user.service';
import { Review } from '../entities/review.entities';
import { Repository } from 'typeorm';
import { MakeReviewDTO } from '../dto/review.dto';
import OpenAI from 'openai';
import { OrderService } from 'src/order/services/order.service';

@Injectable()
export class ReviewService {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly orderService: OrderService,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async getReviewByBookId(bookId: number) {
    const reviews = await this.reviewRepository.find({
      where: { bookId: bookId },
      relations: ['book', 'user', 'replies'],
    });
    return {
      message: reviews.length === 0 ? 'No reviews found for this book' : 'Reviews retrieved successfully',
      data: reviews,
    };
  }

  async checkComentToxic(content: string) {
    try {
      const response = await this.openAi.moderations.create({
        model: 'omni-moderation-latest',
        input: content,
      });

      const result = response.results[0];

      return {
        flagged: result.flagged,
        categories: result.categories,
      };
    } catch (error: any) {
      // Rate limit hoặc lỗi OpenAI
      console.error('OpenAI moderation error:', error?.status);

      return {
        flagged: false,
        categories: {},
        error: 'OPENAI_RATE_LIMIT',
      };
    }
  }

  async canReview(userId: number, bookId: number) {
    const completedOrders = await this.orderService.findOrdersByUserId(userId);

    if (!completedOrders) {
      throw new BadRequestException('User has no completed orders');
    }
    for (const order of completedOrders) {
      console.log(completedOrders);
      for (const item of order.orderItems) {
        if (item.book.id === bookId) {
          return {
            canReview: true,
            message: 'User can review this book',
          };
        }
      }
    }
    throw new BadRequestException('User has not purchased this book');
  }

  async makeReview(userId: number, makeReviewDTO: MakeReviewDTO) {
    const user = await this.userService.findById(userId);

    const book = await this.bookService.findBookById(makeReviewDTO.bookId);

    const moderation = await this.checkComentToxic(makeReviewDTO.comment);

    if (!user || !book) {
      return {
        message: 'User or Book not found',
      };
    }
    if (moderation.flagged) {
      return {
        message: 'Review comment is considered toxic and cannot be submitted',
        categories: moderation.categories,
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
