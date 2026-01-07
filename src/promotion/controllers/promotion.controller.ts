/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PromotionService } from '../services/promotion.service';
import { CreatePromotionDto } from '../dto/promotion.dto';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPromotion(@Body() createPromotionDto: CreatePromotionDto, @Req() req) {
    const userId = req.user.userId;
    return this.promotionService.createPromotion(createPromotionDto, userId);
  }
}
