import { Order } from 'src/order/entities/order.entities';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'enum', enum: ['COD', 'PAYOS', 'MOMO'] })
  method: 'COD' | 'PAYOS' | 'MOMO';

  @Column({ type: 'enum', enum: ['PENDING', 'SUCCESS', 'FAILED', 'UNPAID', 'PAID'], default: 'PENDING' })
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'UNPAID' | 'PAID';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;
  @Column({ unique: true, nullable: true })
  transactionId: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;
}
