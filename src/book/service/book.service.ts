import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entities';
import { CreateBookDto } from '../dto/book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/core/users/user.entities';
import { FavoriteBook } from '../entities/favoriteBook.entities';
import { UserService } from 'src/core/users/user.service';
import { Cart } from '../entities/cart.entities';
import { Category } from 'src/categories/entities/categories.entities';
import { join } from 'path';
import { promises as fs } from 'fs';
import { OrderService } from 'src/order/services/order.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(FavoriteBook)
    private readonly favoriteBookRepository: Repository<FavoriteBook>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly userService: UserService,
    private readonly orderService: OrderService,
  ) {}

  async getCart() {
    const cartItems = await this.cartRepository.find({ relations: ['book', 'user'] });

    // const successPaymentOrders = await this.orderService.findOrderById(1); // Giả sử userId là 1
    return {
      data: cartItems,
      message: 'Cart items retrieved successfully',
    };
  }
  async createBook(book: CreateBookDto, file: Express.Multer.File) {
    // const categoriesId = JSON.parse(book.categoriesId as unknown as string);
    const categoriesId = book.categoriesId.split(',').map((id) => parseInt(id.trim(), 10));

    const categories = await this.categoryRepository.findByIds(categoriesId);

    const newBook = this.bookRepository.create({
      ...book,
      categories: categories,
      photo: file.filename.trim(),
      price: book.price,
    });
    return this.bookRepository.save(newBook);
  }

  async getAllBooks(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [books, total] = await this.bookRepository.findAndCount({
      relations: ['categories', 'ratings'],
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
    });
    return {
      data: books,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      message: 'All books retrieved successfully',
    };
  }

  findBookById(id: number) {
    return this.bookRepository.findOne({ where: { id }, relations: ['categories'] });
  }

  async getBookDetails(id: number) {
    const book = await this.findBookById(id);
    return {
      message: 'book detail',
      data: book,
    };
  }

  async updateBook(id: number, book: Partial<CreateBookDto>, file?: Express.Multer.File) {
    const existingBook = await this.bookRepository.findOne({ where: { id } });
    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    const updatedBook = this.bookRepository.merge(existingBook, {
      ...book,
      price: book.price,
    });

    if (file) {
      const filePath = join(__dirname, '..', '..', 'uploads', file.originalname);
      await fs.writeFile(filePath, file.buffer); // Lưu lại file mới
      updatedBook.photo = file.originalname;
    }

    console.log(updatedBook, 'updatedBook');

    return await this.bookRepository.save(updatedBook);
  }

  async deleteBook(id: number) {
    const book = await this.findBookById(id);
    if (!book) {
      throw new Error('Book not found');
    }
    return this.bookRepository.remove(book);
  }
  async addToFavoriteBook(userId: number, bookId: number) {
    const user = await this.userService.findById(userId);
    const book = await this.findBookById(bookId);
    console.log(book, 'book');
    console.log(user, 'user');
    const favoriteBook = this.favoriteBookRepository.create({
      title: book?.title,
      price: book?.price,
      userId: user?.id,
      bookId: book?.id,
      user: user as User,
      book: book as Book,
    });
    return this.favoriteBookRepository.save(favoriteBook);
  }

  deleteFavoriteBook(id: number) {
    return this.favoriteBookRepository.delete(id);
  }

  async addToCart(userId: number, bookId: number, quantity: number) {
    const existingCartItem = await this.cartRepository
      .createQueryBuilder('cart')
      .where('cart.userId = :userId', { userId })
      .andWhere('cart.bookId = :bookId', { bookId })
      .getOne();

    if (existingCartItem) {
      existingCartItem.quantity += quantity; // tăng số lượng
      return this.cartRepository.save(existingCartItem);
    }

    const user = await this.userService.findById(userId);
    const book = await this.findBookById(bookId);

    const cartItem = this.cartRepository.create({
      userId: user?.id,
      bookId: book?.id,
      user: user as User,
      book: book as Book,
      selected: true,
      quantity,
    });

    return this.cartRepository.save(cartItem);
  }

  async getBestSellerBooks() {
    const books = await this.bookRepository.find({
      where: { badge: 'Best Seller' },
      relations: ['categories', 'ratings'],
    });
    return {
      data: books,
      message: 'Best seller books retrieved successfully',
    };
  }
  async getTotalCart(userId: number) {
    const cartItems = await this.cartRepository.find({ where: { userId }, relations: ['book'] });

    return {
      message: 'Total cart value retrieved successfully',
      data: cartItems,
    };
  }

  async getCartDetail(userId: number) {
    const cartDetail = await this.cartRepository.find({
      where: {
        user: { id: userId },
        // book: {
        //   orderItems: {
        //     order: {
        //       payments: {
        //         status: 'UNPAID',
        //       },
        //     },
        //   },
        // },
      },
      relations: ['book', 'user', 'book.orderItems', 'book.orderItems.order', 'book.orderItems.order.payments'],
    });

    return {
      message: 'Cart detail retrieved successfully',
      data: cartDetail,
    };
  }

  // async getBookPhoto(photoName: string) {
  //   const filePath = join(process.cwd(), 'uploads', photoName);
  //   return fs.readFile(filePath);
  // }
}
