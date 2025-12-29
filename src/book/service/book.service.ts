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
import { SupabaseService } from './supabase.service';
import { Brackets } from 'typeorm/query-builder/Brackets';

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
    private readonly supabaseService: SupabaseService,
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
    const url = await this.supabaseService.uploadFile(
      'book_store',
      `${Date.now()}_${file.originalname}`,
      file.buffer,
      file.mimetype,
    );
    const newBook = this.bookRepository.create({
      ...book,
      categories: categories,
      photo: url,
      fileType: file.mimetype,
      price: book.price,
    });
    return this.bookRepository.save(newBook);
  }

  async getAllBooks(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const query = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.categories', 'categories')
      // .leftJoinAndSelect('book.ratings', 'ratings')
      .leftJoinAndSelect('book.reviews', 'reviews')
      .skip(skip)
      .take(limit)
      .orderBy('book.createdAt', 'ASC');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('book.title LIKE :search').orWhere('book.author LIKE :search');
        }),
        { search: `%${search}%` },
      );
    }

    const [books, total] = await query.getManyAndCount();

    return {
      data: books,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      message: 'All books retrieved successfully',
    };
  }

  findBookById(id: number) {
    return this.bookRepository.findOne({ where: { id }, relations: ['categories', 'reviews', 'favorites'] });
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
      categories: book.categoriesId
        ? await this.categoryRepository.findByIds(book.categoriesId.split(',').map((id) => parseInt(id.trim(), 10)))
        : existingBook.categories,
      photo: file ? existingBook.photo : existingBook.photo,
      fileType: file ? file.mimetype : existingBook.fileType,
    });

    if (file) {
      const url = await this.supabaseService.uploadFile(
        'book_store',
        `${Date.now()}_${file.originalname}`,
        file.buffer,
        file.mimetype,
      );
      updatedBook.photo = url;
    }

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

    const existingFavorite = await this.favoriteBookRepository.find({
      where: {
        userId: userId,
        bookId: bookId,
      },
    });

    if (existingFavorite) {
      return {
        message: 'Book already in favorites',
      };
    }

    const favoriteBook = this.favoriteBookRepository.create({
      title: book?.title,
      price: book?.price,
      userId: user?.id,
      bookId: book?.id,
      photo: book?.photo,
      user: user as User,
      book: book as Book,
    });
    const savedFavoriteBook = await this.favoriteBookRepository.save(favoriteBook);
    return {
      message: 'Book added to favorites',
      favoriteBook: savedFavoriteBook,
    };
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
      orderStatus: 'PENDING',
      selected: true,
      quantity,
    });

    return this.cartRepository.save(cartItem);
  }

  async getBestSellerBooks(limit: number = 10) {
    const bestSellers = await this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.orderItems', 'orderItem')
      .leftJoin('orderItem.order', 'order')
      .leftJoin('order.payments', 'payment')
      .select('book.id', 'id')
      .addSelect('book.title', 'title')
      .addSelect('book.author', 'author')
      .addSelect('book.photo', 'photo')
      .addSelect('book.price', 'price')
      .addSelect('SUM(orderItem.quantity)', 'sold')
      .where('payment.status = :status', { status: 'PAID' }) // hoặc SUCCESS
      .groupBy('book.id')
      .orderBy('sold', 'DESC')
      .limit(limit)
      .getRawMany();

    return {
      message: 'Best seller books retrieved successfully',
      data: bestSellers,
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
        orderStatus: 'PENDING',
      },
      relations: ['book', 'user', 'book.orderItems', 'book.orderItems.order', 'book.orderItems.order.payments'],
    });

    return {
      message: 'Cart detail retrieved successfully',
      data: cartDetail,
    };
  }
}
