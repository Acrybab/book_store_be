/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { BookService } from '../service/book.service';
import { AddToCartDto, CreateBookDto } from '../dto/book.dto';
import { FileInterceptor } from '@nestjs/platform-express';

// import { Response } from 'express';
// import path from 'path/posix';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async createBook(@Body(ValidationPipe) createBookDto: CreateBookDto, @UploadedFile() file: Express.Multer.File) {
    return this.bookService.createBook(createBookDto, file);
  }

  @Get()
  getAllBooks(@Query('page') page: number = 1, @Query('limit') limit: number = 10, @Query('search') search?: string) {
    return this.bookService.getAllBooks(Number(page), Number(limit), search);
  }
  @Get('best-seller')
  getBestSellerBooks() {
    return this.bookService.getBestSellerBooks();
  }
  @Get('cart')
  getCart() {
    return this.bookService.getCart();
  }
  @Get(':id')
  getBookDetails(@Param('id') id: number) {
    return this.bookService.getBookDetails(id);
  }

  @Delete(':id')
  deleteBook(@Param('id') id: number) {
    return this.bookService.deleteBook(id);
  }

  @Get('cart/total')
  @UseGuards(JwtAuthGuard) // bảo vệ route
  getTotalCart(@Req() req) {
    const userID = req.user.userId as number; // sub trong payload JWT
    return this.bookService.getTotalCart(userID);
  }
  @UseGuards(JwtAuthGuard) // bảo vệ route
  @Get('cart/detail')
  async getCartDetail(@Req() req) {
    const userID = req.user.userId as number; // sub trong payload JWT
    return this.bookService.getCartDetail(userID);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  updateBook(
    @Param('id') id: number,
    @Body(ValidationPipe) updateBookDto: Partial<CreateBookDto>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // console.log(file, 'file');
    return this.bookService.updateBook(id, updateBookDto, file);
  }

  @Post(':id/favorite')
  async addToFavorite(@Param('id') bookId: number, @Body('userId') userId: number) {
    return await this.bookService.addToFavoriteBook(userId, bookId);
  }
  @Delete(':id/favorite')
  async removeFromFavorite(@Param('id') bookId: number) {
    console.log(bookId);
    await this.bookService.deleteFavoriteBook(bookId);
    return {
      message: 'Book removed from favorites',
    };
  }

  @Post(':id/cart')
  async addToCart(@Param('id') bookId: number, @Body(ValidationPipe) addToCartDto: AddToCartDto) {
    const addedBookToCart = await this.bookService.addToCart(addToCartDto.userId, bookId, addToCartDto.quantity);
    return {
      message: 'Book added to cart',
      cartItem: addedBookToCart,
    };
  }
  // @Get('photo/:photoName')
  // getBookPhoto(@Param('photoName') photoName: string, @Res() res) {
  //   // return this.bookService.getBookPhoto(photoName).then((fileBuffer) => {
  //   //   res.setHeader('Content-Type', 'image/jpeg'); // Hoặc loại MIME phù hợp với ảnh của bạn
  //   //   res.send(fileBuffer);
  //   // });
  //   // console.log(process.cwd(), 'cwd');
  //   const filePath = path.join('D:\\LearnNestjs\\BookStore\\project-name\\uploads', photoName);
  //   if (!fs.existsSync(filePath)) {
  //     throw new Error('File không tồn tại');
  //   }

  //   return res.sendFile(filePath);
  // }
}
