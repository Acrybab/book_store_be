import { Module } from '@nestjs/common';
import { ShippingAddressController } from './controllers/shippingAddress.controller';
import { ShippingAddressService } from './services/shippingAddress.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingAddress } from './entities/shippingAddress.entity';
import { User } from 'src/core/users/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingAddress, User])],
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService],
  exports: [ShippingAddressService],
})
export class ShippingAddressModule {}
