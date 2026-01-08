import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewReaction } from './review_reaction.entities';
import { ReviewImage } from './review_images';
import { User } from 'src/core/users/user.entities';
import { Book } from 'src/book/entities/book.entities';
import { Reply } from 'src/reply/entities/reply.entities';
import { OrderItem } from 'src/orderItem/entities/orderItem.entities';
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

  @OneToOne(() => OrderItem, (orderItem) => orderItem.review, { onDelete: 'CASCADE' })
  @JoinColumn() // Đặt khóa ngoại trong bảng 'reviews'
  orderItem: OrderItem;

  // Khóa ngoại cụ thể (optional, TypeORM có thể tự xử lý nhưng nên có)
  @Column({ nullable: true })
  orderItemId: number;

  // Thêm trường để dễ dàng lọc và hiển thị 'Verified Purchase'
  @Column({ default: false })
  isVerifiedPurchase: boolean; // Sẽ là TRUE nếu liên kết thành công với OrderItem
}
