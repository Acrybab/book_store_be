import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MakeReviewDTO {
  @IsNumber()
  @IsNotEmpty()
  bookId: number;
  @IsString()
  @IsNotEmpty()
  comment: string;
  @IsNumber()
  @IsNotEmpty()
  rating: number;
}

export class UpdateReviewDTO {}

export class ReactReviewDTO {
  @IsNumber()
  @IsNotEmpty()
  reviewId: number;
  @IsString()
  @IsNotEmpty()
  type: 'like' | 'dislike';
}
