/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ShippingAddressService } from '../services/shippingAddress.service';
import { CreateShippingAddressDto } from '../dto/shippingAddress.dto';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';

@Controller('shipping-address')
export class ShippingAddressController {
  constructor(private readonly shippingAddressService: ShippingAddressService) {}

  @Post()
  async createShippingAddress(@Body() createShippingAddressDto: CreateShippingAddressDto) {
    const { userId, address } = createShippingAddressDto;
    return await this.shippingAddressService.createShippingAddress(userId, address);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // bảo vệ route
  async getShippingAddressesByUserId(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.shippingAddressService.getShippingAddressesByUserId(req.user.userId);
  }
}
