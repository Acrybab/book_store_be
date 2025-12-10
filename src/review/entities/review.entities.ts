import { Book } from 'src/book/entities/book.entities';
import { User } from 'src/core/users/user.entities';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ReviewImage } from './review_images';
import { ReviewReaction } from './review_reaction.entities';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  reviewId: number;
  @Column({ type: 'text' })
  comment: string;
  @Column('int')
  rating: number;
  @OneToMany(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user: User;
  @OneToMany(() => Book, (book) => book.reviews, { onDelete: 'CASCADE' })
  book: Book;
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
