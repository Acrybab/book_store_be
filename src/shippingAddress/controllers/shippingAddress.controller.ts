/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ShippingAddressService } from '../services/shippingAddress.service';
import { CreateShippingAddressDto, UpdateShippingAddressDto } from '../dto/shippingAddress.dto';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';

@Controller('shipping-address')
export class ShippingAddressController {
  constructor(private readonly shippingAddressService: ShippingAddressService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // bảo vệ route
  async createShippingAddress(@Body() createShippingAddressDto: CreateShippingAddressDto) {
    const { userId, address, phoneNumber } = createShippingAddressDto;
    return await this.shippingAddressService.createShippingAddress(userId, address, phoneNumber);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // bảo vệ route
  async getShippingAddressesByUserId(@Req() req) {
    return await this.shippingAddressService.getShippingAddressesByUserId(req.user.userId);
  }

  @Patch(':addressId')
  @UseGuards(JwtAuthGuard) // bảo vệ route
  async updateShippingAddress(
    @Req() req,
    @Param('addressId') addressId: number,
    @Body() updateShippingAddressDto: UpdateShippingAddressDto,
  ) {
    const { address, phoneNumber } = updateShippingAddressDto;
    return await this.shippingAddressService.updateShippingAddress(
      addressId,
      address,
      phoneNumber,
      req.user.userId as number,
    );
  }
  @Delete(':addressId')
  @UseGuards(JwtAuthGuard) // bảo vệ route
  async deleteShippingAddress(@Param('addressId') addressId: number) {
    return await this.shippingAddressService.deleteShippingAddress(addressId);
  }
}
