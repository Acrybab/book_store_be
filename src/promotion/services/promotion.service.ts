import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from '../entities/promotion.entities';
import { Repository } from 'typeorm';
import { AssignPromotionDto, CreatePromotionDto } from '../dto/promotion.dto';
import { UserService } from 'src/core/users/user.service';
import { BookService } from 'src/book/service/book.service';
import { Book } from 'src/book/entities/book.entities';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    private readonly userService: UserService,

    private readonly bookService: BookService,
  ) {}

  async getPromotionsByCode(code: string) {
    const promotion = await this.promotionRepository.findOne({ where: { code } });
    return promotion;
  }

  async getAllPromotions(userId: number) {
    const promotions = await this.promotionRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user', 'books', 'orders'],
    });
    return {
      message: 'Promotions retrieved successfully',
      data: promotions,
    };
  }

  async createPromotion(createPromotionDto: CreatePromotionDto, userId: number) {
    console.log(createPromotionDto, 'create');
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.role || user.role !== 'admin') {
      throw new BadRequestException('Only admin users can create promotions');
    }

    const existedPromotion = await this.getPromotionsByCode(createPromotionDto.code);
    if (existedPromotion) {
      // Ném lỗi 409 Conflict hoặc 400 Bad Request
      throw new BadRequestException('Promotion code already exists');
    }

    // Tạo đối tượng Promotion (sử dụng DTO trực tiếp để so sánh)
    const promotion = this.promotionRepository.create({
      ...createPromotionDto,
      startDate: createPromotionDto.startDate,
      endDate: createPromotionDto.endDate,
      createDiscountAt: new Date(),
      updateDiscountAt: new Date(),
      user: user,
    });

    const startDate = new Date(promotion.startDate);
    // const now = new Date(); // Thời điểm kiểm tra

    if (startDate <= promotion.createDiscountAt) {
      throw new BadRequestException('Start date must be in the future'); // <-- Ném lỗi 400
    }

    // Logic 2: Kiểm tra endDate
    const endDate = new Date(promotion.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date'); // <-- Ném lỗi 400
    }

    const savedPromotion = await this.promotionRepository.save(promotion);

    // Nếu thành công, trả về
    return {
      message: 'Promotion created successfully',
      data: savedPromotion,
    };
  }

  async assignPromotionToBook(assignPromotionToBookDto: AssignPromotionDto, userId: number) {
    const { bookId, discountId } = assignPromotionToBookDto;

    // 2. Tìm Book và BẮT BUỘC load relations 'promotions'
    // Dùng repository trực tiếp thay vì qua service để đảm bảo control được relations
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['promotions'],
    });

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const promotion = await this.promotionRepository.findOne({ where: { discountId } });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // --- VALIDATION LOGIC ---

    // Check trùng: Nếu sách đã có promotion này rồi
    // Dùng optional chaining (?.) để tránh lỗi nếu book.promotions null
    if (book.promotions?.some((p) => p.discountId === promotion.discountId)) {
      throw new BadRequestException('Promotion already assigned to this book');
    }

    // Check giới hạn sử dụng (Nếu nghiệp vụ yêu cầu)
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      throw new BadRequestException('Promotion usage limit has been reached');
    }

    if (!promotion.isActive) {
      throw new BadRequestException('Promotion is not active');
    }

    if (promotion.target !== 'PRODUCT') {
      throw new BadRequestException(
        `Promotion target is '${promotion.target}'. Only 'PRODUCT' target promotions can be assigned directly to a book.`,
      );
    }

    // const now = new Date();
    // // Đảm bảo so sánh ngày đúng kiểu Date
    // if (now >= new Date(promotion.startDate) || now <= new Date(promotion.endDate)) {
    //   throw new BadRequestException('Promotion is not valid at this time');
    // }

    // --- UPDATE DATA ---

    // Tăng count (tùy nghiệp vụ)
    const counted = (promotion.usedCount += 1);
    promotion.usageLimit = promotion.usageLimit - counted;
    console.log(promotion.usageLimit);
    await this.promotionRepository.save(promotion);

    // Gán promotion vào mảng (giữ lại các cái cũ)
    if (!book.promotions) {
      book.promotions = [];
    }
    book.promotions.push(promotion);

    // 3. QUAN TRỌNG: Dùng save() để TypeORM tự động insert vào bảng trung gian
    // update() sẽ KHÔNG hoạt động với quan hệ Many-to-Many
    const savedBook = await this.bookRepository.save(book);

    // --- TRẢ VỀ KẾT QUẢ ---

    // Tính toán giá hiển thị (nếu bạn đã thêm getter currentPrice vào Entity Book thì dùng luôn)
    // Nếu chưa có getter thì tính thủ công ở đây để trả về cho đẹp:
    const currentPrice = savedBook.currentPrice;

    const originalPrice = savedBook.price;

    // (Logic tính giá đơn giản để hiển thị, logic chuẩn nên nằm ở Book Entity như đã bàn)

    return {
      message: 'Promotion assigned to book successfully',
      data: {
        bookId: savedBook.id,
        title: savedBook.title,
        originalPrice: originalPrice,
        // Nếu bạn đã thêm getter currentPrice vào Entity Book:
        currentPrice: currentPrice,
        assignedPromotions: savedBook.promotions.map((p) => ({
          discountId: p.discountId,
          code: p.code,
          value: p.value,
          type: p.type,
        })),
      },
    };
  }
}
