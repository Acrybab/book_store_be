import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  categoriesId: string;

  @IsOptional()
  @IsString()
  photo: string;

  @IsString()
  price: string;

  @IsNotEmpty()
  @IsString()
  badge: string;
}

export class AddToCartDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  bookId: number;

  // @IsArray()
  // @IsNumber({}, { each: true })
  // categoriesId: number[];

  @IsOptional()
  @IsNumber()
  quantity: number;
}
