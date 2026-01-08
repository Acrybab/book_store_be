import { Book } from 'src/book/entities/book.entities';
import { Order } from 'src/order/entities/order.entities';
import { Review } from 'src/review/entities/review.entities';
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Book, (book) => book.orderItems)
  book: Book;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subTotal: number;
  @OneToOne(() => Review, (review) => review.orderItem)
  review: Review;
  // Define your columns and relationships here
}
