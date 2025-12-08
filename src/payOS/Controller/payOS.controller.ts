import { Body, Controller, Post } from '@nestjs/common';
import { PayosService } from '../services/payOS.service';

@Controller('payos')
export class PayOSController {
  constructor(private readonly payosService: PayosService) {}

  @Post('webhook')
  async handleWebhook(@Body() data: any) {
    return this.payosService.handleWebhook(data);
  }
}
