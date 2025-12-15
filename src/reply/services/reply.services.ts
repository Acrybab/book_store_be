import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reply } from '../entities/reply.entities';
import { Repository } from 'typeorm';

@Injectable()
export class ReplyService {
  constructor(
    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>,
  ) {}

  async makeReply(userId: number, reviewId: number, comment: string) {
    const reply = this.replyRepository.create({
      comment,
      review: { reviewId }, // 👈 gán OBJECT
      user: { id: userId }, // 👈 gán OBJECT
    });

    return await this.replyRepository.save(reply);
  }

  async getRepliesByReviewId(reviewId: number) {
    return this.replyRepository.find({
      where: {
        review: { reviewId },
      },
      relations: ['user', 'review'],
    });
  }
}
