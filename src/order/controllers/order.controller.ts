import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/createOrder.dto,';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/:orderCode')
  async getOrderDetails(@Param('orderCode') orderCode: number) {
    return await this.orderService.getOrderDetails(orderCode);
  }

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.orderService.createOrder(dto);
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
