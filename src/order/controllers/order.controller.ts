import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/createOrder.dto,';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto, @Body('idToken') idToken?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.orderService.createOrder(dto, idToken);
  }

  // @Post('verify-phone')
  // async verifyPhone(@Body('idToken') idToken: string) {
  //   return this.orderService.verifyPhone(idToken);
  // }

  @Patch(':id/completed')
  async updateStatus(@Param('id') id: number, @Body('status') status: string) {
    return this.orderService.completeOrder(id, status);
  }

  @Get('/callback/:id')
  async success(@Param('id') orderId: number) {
    return await this.orderService.updatePaymentStatus(orderId);
  }

  @Get('/history/:userId')
  async getOrderHistory(@Param('userId') userId: number) {
    return await this.orderService.retriveOrderHistory(userId);
  }
}
