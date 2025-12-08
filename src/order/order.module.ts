import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entities';
import { OrderItem } from 'src/orderItem/entities/orderItem.entities';
import { Payment } from 'src/payment/entities/payment.entities';
import { OrderController } from './controllers/order.controller';
import { Book } from 'src/book/entities/book.entities';
import { User } from 'src/core/users/user.entities';
import { PayosService } from 'src/payOS/services/payOS.service';
import { Cart } from 'src/book/entities/cart.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Payment, Book, User, Cart])],
  controllers: [OrderController],
  providers: [OrderService, PayosService],
  exports: [OrderService],
})
export class OrderModule {}
