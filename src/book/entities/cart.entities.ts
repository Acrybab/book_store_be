// cart-item.entity.ts
import { User } from 'src/core/users/user.entities';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Book } from './book.entities';

@Entity()
@Unique(['user', 'book']) // Mỗi user chỉ có 1 dòng cho 1 book trong cart
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;
  @Column()
  bookId: number;
  @Column({ default: true })
  selected: boolean;
  @Column({ default: 1 })
  quantity: number;
  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Book, (book) => book.cartItems, { onDelete: 'CASCADE' })
  book: Book;
}
