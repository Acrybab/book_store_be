import { Module } from '@nestjs/common';
import { BookController } from './controller/book.controller';
import { BookService } from './service/book.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entities';
// import { Repository } from 'typeorm';
import { FavoriteBook } from './entities/favoriteBook.entities';
import { User } from 'src/core/users/user.entities';
import { UserService } from 'src/core/users/user.service';
import { Cart } from './entities/cart.entities';
import { Category } from 'src/categories/entities/categories.entities';
import { ShippingAddress } from 'src/shippingAddress/entities/shippingAddress.entity';
import { Order } from 'src/order/entities/order.entities';
import { OrderService } from 'src/order/services/order.service';
import { OrderItem } from 'src/orderItem/entities/orderItem.entities';
import { Payment } from 'src/payment/entities/payment.entities';
import { PayosService } from 'src/payOS/services/payOS.service';
import { MailService } from 'src/common/services/mail.service';
import { SupabaseService } from './service/supabase.service';
// import { FirebaseService } from 'src/firebase/services/firebase.service';
// import { PaymentService } from 'src/vnpay/services/vnpay.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, FavoriteBook, User, Cart, Category, ShippingAddress, Order, OrderItem, Payment]),
  ],
  controllers: [BookController],
  providers: [BookService, UserService, OrderService, PayosService, MailService, SupabaseService],
  exports: [BookService, SupabaseService],
})
export class BookModule {}
