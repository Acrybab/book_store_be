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
import { Promotion } from 'src/promotion/entities/promotion.entities';

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

  @ManyToMany(() => Promotion, (promotion) => promotion.books)
  @JoinTable({
    name: 'book_promotions', // bảng trung gian
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'promotion_id', referencedColumnName: 'discountId' },
  })
  promotions: Promotion[];

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

  get currentPrice(): number {
    // 1. Nếu không load relation promotions hoặc mảng rỗng -> Trả về giá gốc
    if (!this.promotions || this.promotions.length === 0) {
      return Number(this.price); // Lưu ý: Đảm bảo this.price đã là number (như mình nhắc ở trên)
    }

    // const now = new Date();

    // 2. Lọc ra các promotion hợp lệ
    const validPromotions = this.promotions.filter((p) => {
      const startDate = new Date(p.startDate);
      const endDate = new Date(p.endDate);
      const createdAt = new Date(p.createDiscountAt);

      // LOG ĐỂ DEBUG
      const isActive = p.isActive;
      const isStarted = createdAt <= startDate;
      const isNotEnded = startDate <= endDate;
      const hasLimit = p.usedCount < p.usageLimit;

      if (!isStarted) console.log(`Fail StartDate: Now ${createdAt.getDate()} < Start ${startDate.getDate()}`);
      if (!isNotEnded) console.log(`Fail EndDate: Now ${createdAt.getDate()} > End ${endDate.getDate()}`);
      if (!hasLimit) console.log(`Fail Limit: Used ${p.usedCount} >= Limit ${p.usageLimit}`);

      return isActive && isStarted && isNotEnded && hasLimit;
    });

    if (validPromotions.length === 0) {
      return Number(this.price);
    }
    console.log('maxDiscountAmount');

    // 3. Tìm khuyến mãi giảm sâu nhất (Best Discount)
    let maxDiscountAmount = 0;

    for (const p of validPromotions) {
      console.log('maxDiscountAmount');

      let discountAmount = 0;

      if (p.type === 'PERCENT') {
        // Ví dụ: Giá 100k, giảm 20% -> giảm 20k
        discountAmount = (Number(this.price) * p.value) / 100;
      } else if (p.type === 'FIXED_AMOUNT') {
        // Ví dụ: Giảm thẳng 50k
        discountAmount = p.value;
      }

      if (discountAmount > maxDiscountAmount) {
        maxDiscountAmount = discountAmount;
      }
    }
    // 4. Trả về giá cuối cùng (không được âm)
    return Math.max(0, Number(this.price) - maxDiscountAmount);
  }
}
