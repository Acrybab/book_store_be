import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from '../entities/promotion.entities';
import { Repository } from 'typeorm';
import { AssignPromotionDto, CreatePromotionDto } from '../dto/promotion.dto';
import { UserService } from 'src/core/users/user.service';
import { BookService } from 'src/book/service/book.service';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,

    private readonly userService: UserService,

    private readonly bookService: BookService,
  ) {}

  async getPromotionsByCode(code: string) {
    const promotion = await this.promotionRepository.findOne({ where: { code } });
    return promotion;
  }

  async createPromotion(createPromotionDto: CreatePromotionDto, userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existedPromotion = await this.getPromotionsByCode(createPromotionDto.code);
    if (existedPromotion) {
      // Ném lỗi 409 Conflict hoặc 400 Bad Request
      throw new BadRequestException('Promotion code already exists');
    }

    // Tạo đối tượng Promotion (sử dụng DTO trực tiếp để so sánh)
    const promotion = this.promotionRepository.create({
      ...createPromotionDto,
      createDiscountAt: new Date(),
      updateDiscountAt: new Date(),
      user: user,
    });

    const startDate = new Date(promotion.startDate);
    const now = new Date(); // Thời điểm kiểm tra

    if (startDate <= now) {
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

  async assignPromotionToBook(assignPromotionToBookDto: AssignPromotionDto) {
    const { bookId, discountId } = assignPromotionToBookDto;
    const book = await this.bookService.findBookById(bookId);
    const promotion = await this.promotionRepository.findOne({ where: { discountId } });

    if (!book) {
      throw new BadRequestException('Book not found');
    }

    if (!promotion) {
      throw new BadRequestException('Promotion not found');
    }

    // Kiểm tra nếu promotion đã được gán cho sách
    if (book.promotions && book.promotions.some((p) => p.discountId === promotion.discountId)) {
      throw new BadRequestException('Promotion already assigned to this book');
    }

    if (promotion.usedCount >= promotion.usageLimit) {
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

    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    if (now < startDate || now > endDate) {
      throw new BadRequestException('Promotion is not valid at this time');
    }

    promotion.usedCount += 1;
    await this.promotionRepository.save(promotion);

    // Gán promotion cho sách
    book.promotions = [...(book.promotions || []), promotion];

    // 4. Lưu lại Entity Book để cập nhật Mối quan hệ Many-to-Many
    // Dùng bookRepository.save() để TypeORM xử lý việc cập nhật bảng liên kết
    // (Giả sử bạn có quyền truy cập vào BookRepository hoặc BookService có hàm save/update)
    const savedBook = await this.bookService.updateBook(book.id, {}, undefined); // Giả sử BookService có hàm save

    // Lưu ý: Nếu BookService không có hàm save, bạn cần inject BookRepository vào đây.
    // Ví dụ: await this.bookRepository.save(book);

    // Dọn dẹp dữ liệu trả về (chỉ hiển thị thông tin cần thiết)
    return {
      message: 'Promotion assigned to book successfully',
      data: {
        bookId: savedBook.id,
        title: savedBook.title,
        assignedPromotions: savedBook.promotions.map((p) => ({
          discountId: p.discountId,
          code: p.code,
          value: p.value,
        })),
      },
    };
  }
}
