/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';
import { MakeReviewDTO } from '../dto/review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  @UseGuards(JwtAuthGuard)
  @Post('')
  async makeReview(@Req() req, @Body() makeReviewDTO: MakeReviewDTO) {
    const userID = req.user.userId as number;
    const newReview = await this.reviewService.makeReview(userID, makeReviewDTO);
    return {
      message: 'Review created successfully',
      data: newReview,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAllReviews() {
    return this.reviewService.getAllReviews();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':bookId')
  async getReviewByBookId(@Param('bookId') bookId: number) {
    return this.reviewService.getReviewByBookId(bookId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':reviewId')
  async reactToReview(@Param('reviewId') reviewId: number) {
    await this.reviewService.deleteReview(reviewId);
    return {
      message: 'Delete review successfully',
    };
  }
}
