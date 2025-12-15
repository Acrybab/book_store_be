import { User } from 'src/core/users/user.entities';
import { Review } from 'src/review/entities/review.entities';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('replies')
export class Reply {
  @PrimaryGeneratedColumn()
  replyId: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => Review, (review) => review.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @ManyToOne(() => User, (user) => user.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
