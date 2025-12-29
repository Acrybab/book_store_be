/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PayOS from '@payos/node';
import { Cart } from 'src/book/entities/cart.entities';
import { Order } from 'src/order/entities/order.entities';
import { Payment } from 'src/payment/entities/payment.entities';
import { Repository, In } from 'typeorm';

@Injectable()
export class PayosService {
  private payos: PayOS;

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {
    this.payos = new PayOS(process.env.PAYOS_CLIENT_ID!, process.env.PAYOS_API_KEY!, process.env.PAYOS_CHECKSUM_KEY!);
  }

  async createPaymentLink(orderCode: number, amount: number, description: string) {
    const paymentLink = await this.payos.createPaymentLink({
      orderCode, // mã đơn hàng (unique)
      amount, // số tiền
      description, // mô tả đơn hàng
      returnUrl: `https://bookshop-trong-khang.vercel.app/order/call-back/${orderCode}`, // callback khi user thanh toán xong
      cancelUrl: 'https://bookshop-trong-khang.vercel.app/order/cancel', // callback khi user hủy
    });
    return paymentLink;
  }

  async handleWebhook(payosData: any) {
    console.log('Raw webhook data:', payosData);

    const { orderCode, desc } = payosData.data;

    if (desc === 'success') {
      const payment = await this.paymentRepository.findOne({
        where: { order: { id: orderCode } },
        relations: ['order', 'order.user', 'order.orderItems', 'order.orderItems.book'],
      });

      if (payment) {
        // 1. Cập nhật trạng thái payment
        payment.status = 'PAID';
        const paidedStatus = await this.paymentRepository.save(payment);
        console.log(paidedStatus, 'paidedStatus');
        // 2. Cập nhật trạng thái order
        payment.order.status = 'SUCCESS';
        await this.orderRepository.save(payment.order);

        // 🧩 3. Lấy userId + bookIds
        const userId = payment.order.user.id;
        const bookIds = payment.order.orderItems.map((item) => item.book.id);

        // Debug log (rất quan trọng!)
        console.log('Deleting cart for:', { userId, bookIds });

        // 🔥 4. XÓA CART
        await this.cartRepository.delete({
          userId: userId,
          bookId: In(bookIds),
        });
      }
    }

    return { message: 'Webhook processed successfully' };
  }

  verifyWebhook(payload: any) {
    return this.payos.verifyPaymentWebhookData(payload);
  }
}
