import { User } from 'src/core/users/user.entities';
import { OrderItem } from 'src/orderItem/entities/orderItem.entities';
import { Payment } from 'src/payment/entities/payment.entities';
import { ShippingAddress } from 'src/shippingAddress/entities/shippingAddress.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ nullable: true })
  shippingAddressId: number;

  @ManyToOne(() => ShippingAddress, (shippingAddress) => shippingAddress.orders, { nullable: true })
  @JoinColumn({ name: 'shippingAddressId' }) // ⭐ QUAN TRỌNG
  shippingAddress: ShippingAddress;

  @ManyToOne(() => User, (user) => user.orders)
  user: Partial<User>;

  @CreateDateColumn()
  orderDate: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order, { cascade: true })
  payments: Payment[];

  @UpdateDateColumn()
  updatedAt: Date;
}
