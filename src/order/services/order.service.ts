import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entities/order.entities';
import { Repository } from 'typeorm';
import { OrderItem } from 'src/orderItem/entities/orderItem.entities';
import { Payment } from 'src/payment/entities/payment.entities';
import { Book } from 'src/book/entities/book.entities';
import { CreateOrderDto } from '../dto/createOrder.dto,';
import { User } from 'src/core/users/user.entities';
import { PayosService } from 'src/payOS/services/payOS.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private payosService: PayosService,
  ) {}

  async findOrderById(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    return order?.id;
  }

  async createOrder(dto: CreateOrderDto, idToken?: string): Promise<any> {
    console.log(idToken);
    const user = await this.userRepository.findOneBy({ id: dto.userId });
    if (!user) throw new NotFoundException('User not found');

    let totalAmount = 0;
    const items: OrderItem[] = [];

    for (const item of dto.items) {
      const book = await this.bookRepository.findOneBy({ id: item.bookId });
      if (!book) throw new NotFoundException(`Book ${item.bookId} not found`);

      const subTotal = Number(book.price) * item.quantity;
      totalAmount += subTotal;

      const orderItem = this.orderItemRepository.create({
        book,
        quantity: item.quantity,
        price: book.price,
        subTotal,
      });
      items.push(orderItem);
    }

    // 🔹 Tạo Order
    const order = this.orderRepository.create({
      totalAmount,
      status: 'PENDING',
      user: { id: user.id },
      orderItems: items,
      orderDate: new Date(),
    });

    await this.orderRepository.save(order);

    for (const orderItem of items) {
      orderItem.order = order;
      await this.orderItemRepository.save(orderItem);
    }

    // 🔹 Payment
    let payment: Payment;
    let checkoutUrl: string | null = null;

    if (dto.paymentMethod === 'PAYOS') {
      // gọi PayOS để tạo link thanh toán
      const payosLink = await this.payosService.createPaymentLink(
        order.id, // orderCode = id order
        totalAmount,
        `Thanh toán đơn hàng #${order.id}`,
      );

      checkoutUrl = payosLink.checkoutUrl;

      payment = this.paymentRepository.create({
        order: order,
        method: 'PAYOS',
        amount: totalAmount,
        status: 'UNPAID',
        createdAt: new Date(),
        updatedAt: new Date(),
        transactionId: payosLink.paymentLinkId, // id từ PayOS
      });
    } else {
      // COD
      // let phoneIntl = dto.phone;

      // // Nếu số bắt đầu bằng 0 (VN) → đổi sang +84
      // if (phoneIntl.startsWith('0')) {
      //   phoneIntl = '+84' + phoneIntl.slice(1);
      // }

      // await this.twilioService.sendVerification(phoneIntl);
      payment = this.paymentRepository.create({
        order,
        method: 'COD',
        amount: totalAmount,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await this.paymentRepository.save(payment);

    const foundOrder = await this.orderRepository.findOne({
      where: { id: order.id },
      relations: ['orderItems', 'payments'],
    });
    if (!foundOrder) {
      throw new NotFoundException('Order not found');
    }

    // Nếu là PayOS thì trả thêm checkoutUrl để FE redirect
    return {
      data: {
        order: foundOrder,
        checkoutUrl,
      },
    };
  }

  async updatePaymentStatus(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['payments'],
    });

    if (!order) throw new NotFoundException('Order not found');

    // Update Payment
    const payment = order.payments[0];
    payment.status = 'PAID';
    await this.paymentRepository.save(payment);

    // Update Order
    order.status = 'PROCESS';
    await this.orderRepository.save(order);

    return { success: true };
  }

  async completeOrder(orderId: number, statusOrder: string) {
    await this.orderRepository.update(orderId, { status: statusOrder });
  }

  async retriveOrderHistory(userId: number) {
    const orders = await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['orderItems', 'payments', 'orderItems.book'],
    });
    return orders;
  }
}
