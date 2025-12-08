import { Module } from '@nestjs/common';
import { PayosService } from './services/payOS.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payment/entities/payment.entities';
import { Order } from 'src/order/entities/order.entities';
import { Cart } from 'src/book/entities/cart.entities';
import { OrderService } from 'src/order/services/order.service';
import { Book } from 'src/book/entities/book.entities';
import { User } from 'src/core/users/user.entities';
import { OrderItem } from 'src/orderItem/entities/orderItem.entities';
import { Category } from 'src/categories/entities/categories.entities';
import { PayOSController } from './Controller/payOS.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order, Cart, Book, User, OrderItem, Category])],
  controllers: [PayOSController],
  providers: [PayosService, OrderService],
  exports: [PayosService],
})
export class PayosModule {}
