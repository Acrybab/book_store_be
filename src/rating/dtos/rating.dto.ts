import { IsNumber, IsString, Length } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  bookId: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  rating: number;

  @IsString()
  @Length(2, 100)
  comment: string;
}

export class UpdateRatingDto {
  @IsNumber()
  rating: number;

  @IsString()
  @Length(2, 100)
  comment: string;
}
