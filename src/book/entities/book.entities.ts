import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FavoriteBook } from './favoriteBook.entities';
import { Cart } from './cart.entities';
import { Category } from 'src/categories/entities/categories.entities';
import { OrderItem } from 'src/orderItem/entities/orderItem.entities';
import { Rating } from 'src/rating/entities/rating.entities';
import { Review } from 'src/review/entities/review.entities';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  author: string;
  @Column()
  description: string;
  @Column({ nullable: true })
  photo: string;
  @Column({ nullable: true })
  fileType: string;
  @Column()
  price: string;
  @Column()
  publisher: string;
  @Column()
  stockQuantity: string;
  @Column()
  badge: string;
  @Column()
  language: string;
  @Column()
  numberOfPages: string;
  @Column()
  format: string;
  @OneToMany(() => FavoriteBook, (favorite) => favorite.book)
  favorites: FavoriteBook[];

  @OneToMany(() => Cart, (cart) => cart.book)
  cartItems: Cart[];
  @ManyToMany(() => Category, (category) => category.books)
  @JoinTable({
    name: 'book_categories', // bảng trung gian
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.book)
  orderItems: OrderItem[];
  @OneToMany(() => Rating, (rating) => rating.book)
  ratings: Rating[];
  @OneToMany(() => Review, (review) => review.book)
  reviews: Review[];

  @CreateDateColumn()
  createdBookAt: Date;

  @UpdateDateColumn()
  updatedBookAt: Date;
}
