import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entities';
import { User } from 'src/core/users/user.entities';

@Entity('favorite_books')
export class FavoriteBook {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  price: string;
  @Column()
  userId: number;
  @Column()
  bookId: number;
  @ManyToMany(() => Book, (book) => book.favorites)
  book: Book;
  @ManyToMany(() => User, (user) => user.favorites)
  user: User;
}
