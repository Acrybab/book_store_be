/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ReplyService } from '../services/reply.services';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';
import { CreateReplyDto } from '../dto/replies.dto';

@Controller('replies')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async makeReply(@Request() req, @Body() createReplyDto: CreateReplyDto) {
    const userId = req.user.userId as number;
    const newReply = await this.replyService.makeReply(userId, createReplyDto.reviewId, createReplyDto.comment);
    return {
      message: 'Reply created successfully',
      data: newReply,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get(':reviewId')
  async getRepliesByReviewId(@Body('reviewId') reviewId: number) {
    const replies = await this.replyService.getRepliesByReviewId(reviewId);
    return {
      message: replies.length === 0 ? 'No replies found for this review' : 'Replies retrieved successfully',
      data: replies,
    };
  }
}
