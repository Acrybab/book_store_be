import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entities';

@Entity('review_reactions')
export class ReviewReaction {
  @PrimaryGeneratedColumn()
  reactionId: number;
  @Column({ type: 'enum', enum: ['like', 'dislike'] })
  type: string;
  @ManyToOne(() => Review, (review) => review.reactions, {
    onDelete: 'CASCADE',
  })
  review: Review;
  @CreateDateColumn()
  reactionAt: Date;
}
