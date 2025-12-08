import { Cart } from 'src/book/entities/cart.entities';
import { FavoriteBook } from 'src/book/entities/favoriteBook.entities';
import { Order } from 'src/order/entities/order.entities';
import { Rating } from 'src/rating/entities/rating.entities';
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

  @Column({ nullable: true })
  password: string;
  @Column()
  shippingAddressId: number;
  @Column({ nullable: true })
  phoneNumber: string;
  @Column({ nullable: true })
  avatar: string;
  @Column({ nullable: true })
  confirmPassword: string;
  @OneToMany(() => FavoriteBook, (favorite) => favorite.user)
  favorites: FavoriteBook[];
  @OneToMany(() => Cart, (cartItem) => cartItem.user)
  cartItems: Cart[];
  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
  @OneToMany(() => ShippingAddress, (address) => address.user)
  shippingAddresses: ShippingAddress[];
}
