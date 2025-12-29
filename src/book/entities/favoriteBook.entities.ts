import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'; // Nhớ import JoinColumn
import { Book } from './book.entities'; // Kiểm tra đường dẫn
import { User } from 'src/core/users/user.entities'; // Kiểm tra đường dẫn

@Entity('favorite_books')
export class FavoriteBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  price: string;

  @Column()
  photo: string;

  // --- Cột ID thuần túy ---
  @Column()
  userId: number;

  @Column()
  bookId: number;

  @ManyToOne(() => Book, (book) => book.favorites)
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'userId' })
  user: User;
}
