import { User } from 'src/core/users/user.entities';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @ManyToOne(() => User, (user) => user.shippingAddresses, { onDelete: 'CASCADE' })
  user: User; // mối quan hệ ManyToOne với User
  // Define columns and relationships here
}
