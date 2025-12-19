import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewReaction } from '../entities/review_reaction.entities';
import { Review } from '../entities/review.entities';
import { Repository } from 'typeorm';
import { ReactReviewDTO } from '../dto/review.dto';

@Injectable()
export class ReactReviewService {
  constructor(
    @InjectRepository(ReviewReaction)
    private readonly reviewReactionRepository: Repository<ReviewReaction>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async reactToReview(userId: number, reactReview: ReactReviewDTO) {
    const existingReaction = await this.reviewReactionRepository.findOne({
      where: {
        user: { id: userId },
        review: { reviewId: reactReview.reviewId },
        type: reactReview.type,
      },
    });

    if (!existingReaction) {
      const reaction = this.reviewReactionRepository.create({
        type: reactReview.type,
        review: { reviewId: reactReview.reviewId },
        user: { id: userId },
      });

      await this.reviewReactionRepository.save(reaction);

      await this.updateReviewReactionStats(reactReview.reviewId);

      return {
        message: 'Reaction added successfully',
      };
    }
    if (existingReaction.type === reactReview.type) {
      existingReaction.type = 'null';
    } else {
      existingReaction.type = reactReview.type;
    }

    // Nếu có rồi → cập nhật type
    await this.reviewReactionRepository.save(existingReaction);

    // cập nhật lại review
    await this.updateReviewReactionStats(reactReview.reviewId);

    return {
      message: 'Reaction updated successfully',
      reactReview: existingReaction,
    };
  }

  async updateReviewReactionStats(reviewId: number) {
    const likeCount = await this.reviewReactionRepository.count({
      where: { review: { reviewId }, type: 'like' },
    });

    const dislikeCount = await this.reviewReactionRepository.count({
      where: { review: { reviewId }, type: 'dislike' },
    });

    await this.reviewRepository.update(reviewId, {
      totalLikes: likeCount,
      totalDislikes: dislikeCount,
    });
  }
}
