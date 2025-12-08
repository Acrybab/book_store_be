import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RatingService } from '../services/rating.service';
import { CreateRatingDto } from '../dtos/rating.dto';
import { Rating } from '../entities/rating.entities';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  async createRating(@Body() createRatingDto: CreateRatingDto) {
    const ratedBook = await this.ratingService.ratingBook(createRatingDto);

    return {
      message: 'Rating book successfuly',
      data: ratedBook,
    };

    // Implement your logic to create a rating
  }

  @Patch('/:id')
  async updateRating(@Param('id') id: number, @Body() updateRatingDto: Partial<Rating>) {
    const updatedRating = await this.ratingService.updateRatingBook(id, updateRatingDto);

    return {
      message: 'Rating updated successfully',
      data: updatedRating,
    };
  }

  @Delete('/:id')
  async deleteRating(@Param('id') id: number) {
    await this.ratingService.deleteRatingBook(id);
    return {
      message: 'Rating deleted successfully',
    };
  }

  @Get(':bookId')
  async getRatingsByBook(@Param('bookId') bookId: number) {
    return this.ratingService.getRatingsByBook(bookId);
  }
}
