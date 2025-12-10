import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entities';

@Entity('review_images')
export class ReviewImage {
  @PrimaryGeneratedColumn()
  reviewImageId: number;
  @ManyToOne(() => Review, (review) => review.images, {
    onDelete: 'CASCADE',
  })
  review: Review;
  @Column()
  imageUrl: string;
}
