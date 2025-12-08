import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './core/users/user.entities';
import { UserModule } from './core/users/user.module';
import { AuthController } from './core/auth/auth.controller';

import { UserController } from './core/users/user.controller';
import { BookController } from './book/controller/book.controller';
import { BookModule } from './book/book.module';
import { Book } from './book/entities/book.entities';
import { FavoriteBook } from './book/entities/favoriteBook.entities';
import { Cart } from './book/entities/cart.entities';
import { PaymentModule } from './vnpay/payment.module';
import { Category } from './categories/entities/categories.entities';
import { CategoriesController } from './categories/controller/categories.controller';
import { CategoriesModule } from './categories/categories.module';
import { Order } from './order/entities/order.entities';
import { OrderItem } from './orderItem/entities/orderItem.entities';
import { Payment } from './payment/entities/payment.entities';
import { OrderController } from './order/controllers/order.controller';
import { OrderModule } from './order/order.module';
import { PayOSController } from './payOS/Controller/payOS.controller';
import { Rating } from './rating/entities/rating.entities';
import { RatingController } from './rating/controllers/rating.controller';
import { RatingModule } from './rating/rating.module';
import { CorsMiddleware } from './cors.middleware';
import { ShippingAddress } from './shippingAddress/entities/shippingAddress.entity';
import { ShippingAddressController } from './shippingAddress/controllers/shippingAddress.controller';
import { ShippingAddressModule } from './shippingAddress/shipping.moudle';
import { ConfigModule } from '@nestjs/config';
import { PayosModule } from './payOS/payos.module';
// import { PaymentController } from './vnpay/controller/payment.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL, // URL Railwailay

      ssl: { rejectUnauthorized: false },

      autoLoadEntities: true,

      entities: [User, Book, FavoriteBook, Cart, Category, Order, OrderItem, Payment, Rating, ShippingAddress],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true, // dùng toàn project
    }),
    UserModule,
    BookModule,
    PaymentModule,
    CategoriesModule,
    OrderModule,
    RatingModule,
    ShippingAddressModule,
    PayosModule,
    // AuthModule,
  ],

  controllers: [
    AppController,
    AuthController,
    UserController,
    BookController,
    CategoriesController,
    OrderController,
    PayOSController,
    RatingController,
    ShippingAddressController,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
