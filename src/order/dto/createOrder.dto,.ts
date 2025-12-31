import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { OrderItemDto } from 'src/orderItem/dto/orderItem.dto';

export class CreateOrderDto {
  userId: number;
  shippingAddressId: number;
  note?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
  paymentMethod: 'COD' | 'PAYOS' | 'MOMO';
}
