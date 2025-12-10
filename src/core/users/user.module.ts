import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entities';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from '../auth/google.strategy';
// import { AuthModule } from '../auth/auth.module';
import { JwtStrategy } from '../auth/jwt.strategy';
import { ShippingAddress } from 'src/shippingAddress/entities/shippingAddress.entity';
import { MailService } from 'src/common/services/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ShippingAddress]),

    JwtModule.register({
      global: true,
      secret: process.env.MY_SECRET_KEY || 'default-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtService, GoogleStrategy, JwtStrategy, MailService],
  exports: [UserService, MailService],
})
export class UserModule {}
