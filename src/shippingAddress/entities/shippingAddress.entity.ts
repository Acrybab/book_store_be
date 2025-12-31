import { User } from 'src/core/users/user.entities';
import { Order } from 'src/order/entities/order.entities';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shipping_addresses')
export class ShippingAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shippingAddress: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column()
  userId: number;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @OneToMany(() => Order, (order) => order.shippingAddress)
  orders: Order[];

  @ManyToOne(() => User, (user) => user.shippingAddresses, {
    onDelete: 'CASCADE',
  })
  user: User;
}
