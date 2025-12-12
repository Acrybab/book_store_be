/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';
import { ReactReviewService } from '../services/react_review.service';
import { ReactReviewDTO } from '../dto/review.dto';

@Controller('react-reviews')
export class ReactReviewController {
  constructor(private readonly reactReviewService: ReactReviewService) {}
  @Post('')
  @UseGuards(JwtAuthGuard)
  async reactToReview(@Req() req, @Body() body: ReactReviewDTO) {
    const userID = req.user.userId as number;
    const reactionResult = await this.reactReviewService.reactToReview(userID, body);
    return {
      message: reactionResult.message,
    };
  }
}
