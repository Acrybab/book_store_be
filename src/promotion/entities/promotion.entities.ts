import { Book } from 'src/book/entities/book.entities';
import { User } from 'src/core/users/user.entities';
import { Order } from 'src/order/entities/order.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn()
  discountId: number;
  @Column({ unique: true })
  code: string;
  @Column()
  type: string;
  @Column('decimal')
  value: number;
  @Column({ type: 'enum', enum: ['PRODUCT', 'CART', 'SHIPPING'] })
  target: string;
  @Column('timestamp')
  startDate: string;
  @Column('timestamp')
  endDate: string;
  @Column()
  usageLimit: number;
  @Column()
  usedCount: number;
  @Column()
  isActive: boolean;
  @Column()
  minCartValue: number;
  @CreateDateColumn()
  createDiscountAt: Date;
  @UpdateDateColumn()
  updateDiscountAt: Date;
  @ManyToMany(() => Book, (book) => book.promotions)
  books: Book[];
  @ManyToOne(() => User, (user) => user.promotions)
  user: User;
  @ManyToMany(() => Order, (order) => order.promotions)
  orders: Order[];
}
