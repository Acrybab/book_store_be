import { Book } from 'src/book/entities/book.entities';
import { User } from 'src/core/users/user.entities';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('rating')
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  score: number;
  @Column()
  comment: string;
  @ManyToOne(() => User, (user) => user.ratings)
  user: User;
  @ManyToOne(() => Book, (book) => book.ratings)
  book: Book;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
