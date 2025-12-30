import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
  @IsNotEmpty()
  @IsString()
  quantity: string;
  @IsNotEmpty()
  @IsString()
  publisher: string;
  @IsNotEmpty()
  @IsString()
  language: string;
  @IsNotEmpty()
  @IsString()
  format: string;
  @IsNotEmpty()
  @IsString()
  numberOfPages: string;
}

export class AddToCartDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  bookId: number;

  @IsOptional()
  @IsNumber()
  quantity: number;
}
