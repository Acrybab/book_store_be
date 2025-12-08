import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  //   @IsArray()
  //   @ArrayNotEmpty()
  //   @IsString({ each: true })
  //   books: Book[];

  //   @ArrayNotEmpty()
  //   @IsNumber({}, { each: true })
  //   bookId: number[];
}
