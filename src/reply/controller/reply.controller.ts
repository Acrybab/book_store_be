/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
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
  @UseGuards(JwtAuthGuard)
  @Delete(':replyId')
  async deleteReply(@Param('replyId') replyId: number) {
    await this.replyService.deleteReply(replyId);
    return {
      message: 'Reply deleted successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('modify/:replyId')
  async modifyReply(@Param('replyId') replyId: number, @Body('comment') comment: string) {
    const updatedReply = await this.replyService.modifyReply(replyId, comment);
    return {
      message: 'Reply updated successfully',
      data: updatedReply,
    };
  }
}
