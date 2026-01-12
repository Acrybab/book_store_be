/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PromotionService } from '../services/promotion.service';
import { AssignPromotionDto, CreatePromotionDto } from '../dto/promotion.dto';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPromotion(@Body() createPromotionDto: CreatePromotionDto, @Req() req) {
    const userId = req.user.userId as number;
    return this.promotionService.createPromotion(createPromotionDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign')
  async assignPromotionToBook(@Body() assignPromotionDto: AssignPromotionDto, @Req() req) {
    const userId = req.user.userId as number;
    return this.promotionService.assignPromotionToBook(assignPromotionDto, userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPromotions(@Req() req) {
    const userId = req.user.userId as number;
    return this.promotionService.getAllPromotions(userId);
  }
}
