import { Exclude } from 'class-transformer';
import { Cart } from 'src/book/entities/cart.entities';
import { FavoriteBook } from 'src/book/entities/favoriteBook.entities';
import { Order } from 'src/order/entities/order.entities';
import { Promotion } from 'src/promotion/entities/promotion.entities';
import { Rating } from 'src/rating/entities/rating.entities';
import { Reply } from 'src/reply/entities/reply.entities';
import { Review } from 'src/review/entities/review.entities';
import { ShippingAddress } from 'src/shippingAddress/entities/shippingAddress.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
  @Exclude()
  @Column({ nullable: true })
  password: string;
  @Column({ nullable: true })
  shippingAddressId: number;
  @Column({ default: false })
  isVerified: boolean;
  @Column({ nullable: true })
  avatar: string;
  @Column({ nullable: true, default: 'user' })
  role: string;
  @Exclude()
  @Column({ nullable: true })
  confirmPassword: string;
  @OneToMany(() => FavoriteBook, (favorite) => favorite.user)
  favorites: FavoriteBook[];
  @OneToMany(() => Cart, (cartItem) => cartItem.user)
  cartItems: Cart[];
  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];
  @OneToMany(() => ShippingAddress, (address) => address.user, { cascade: true, onDelete: 'CASCADE' })
  shippingAddresses: ShippingAddress[];

  @OneToMany(() => Order, (order) => order.user, { cascade: true, onDelete: 'CASCADE' })
  orders: Order[];
  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
  @OneToMany(() => Reply, (reply) => reply.user)
  replies: Reply[];
  @OneToMany(() => Promotion, (promotion) => promotion.user)
  promotions: Promotion[];
}
