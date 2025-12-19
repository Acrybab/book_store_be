import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewReaction } from './review_reaction.entities';
import { ReviewImage } from './review_images';
import { User } from 'src/core/users/user.entities';
import { Book } from 'src/book/entities/book.entities';
import { Reply } from 'src/reply/entities/reply.entities';
@Unique(['user', 'review'])
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  reviewId: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ default: 0 })
  totalLikes: number;

  @Column({ default: 0 })
  totalDislikes: number;

  /* ================= USER & BOOK ================= */

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Book, (book) => book.reviews, { onDelete: 'CASCADE' })
  book: Book;

  @Column()
  bookId: number;

  /* ================= REPLY COMMENT ================= */

  @OneToMany(() => Reply, (reply) => reply.review, {
    cascade: true,
  })
  replies: Reply[];

  // Review cha (null nếu là comment gốc)

  /* ================= IMAGES & REACTIONS ================= */

  @OneToMany(() => ReviewImage, (image) => image.review, {
    cascade: true,
  })
  images: ReviewImage[];

  @OneToMany(() => ReviewReaction, (reaction) => reaction.review, {
    cascade: true,
  })
  reactions: ReviewReaction[];

  @CreateDateColumn()
  reviewAt: Date;

  @UpdateDateColumn()
  updateReviewAt: Date;
}
