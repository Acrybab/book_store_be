import { IsNumber } from 'class-validator';

export class OrderItemDto {
  @IsNumber()
  bookId: number;

  @IsNumber()
  quantity: number;
}
