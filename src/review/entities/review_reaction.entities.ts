import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Review } from './review.entities';
import { User } from 'src/core/users/user.entities';

// fix error
@Unique(['user', 'review'])
@Entity('review_reactions')
export class ReviewReaction {
  @PrimaryGeneratedColumn()
  reactionId: number;
  @Column({ type: 'enum', enum: ['like', 'dislike', 'null'] })
  type: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
  @ManyToOne(() => Review, (review) => review.reactions, {
    onDelete: 'CASCADE',
  })
  review: Review;
  @CreateDateColumn()
  reactionAt: Date;
}
