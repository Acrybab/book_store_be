/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Query } from '@nestjs/common';
import { PaymentService } from '../services/vnpay.service';
import moment from 'moment';
import crypto from 'crypto';
import qs from 'qs';
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Get('create-vnpay-url')
  createVNPayUrl(@Query() query) {
    console.log(query, 'query');
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId = moment(date).format('HHmmss');

    const ipAddr = '127.0.0.1'; // dùng IPv4 thay vì ::1
    const tmnCode = 'YOUR_TMN_CODE';
    const secretKey = 'YOUR_SECRET_KEY';
    const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = 'http://localhost:3000/payment/vnpay_return';

    const amount = 100000; // VND
    const bankCode = 'NCB';

    const locale = 'vn';
    const currCode = 'VND';

    const vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Bước 1: Sắp xếp key theo thứ tự alphabet
    const sortedParams = this.sortObject(vnp_Params);

    // Bước 2: Tạo chuỗi query để hash
    const signData = qs.stringify(sortedParams, { encode: false });

    // Bước 3: Hash SHA256
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Bước 4: Gắn vnp_SecureHash
    sortedParams['vnp_SecureHash'] = signed;

    // Bước 5: Tạo URL thanh toán
    const paymentUrl = vnpUrl + '?' + qs.stringify(sortedParams, { encode: true });

    return { paymentUrl };
  }
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }
  @Get('vnpay-return')
  vnPayReturn(@Query() query: any) {
    const isValid = this.paymentService.verifyVNPayReturn(query);
    if (isValid) {
      return { code: query['vnp_ResponseCode'], message: 'Thanh toán thành công!' };
    } else {
      return { code: '97', message: 'Chữ ký không hợp lệ' };
    }
  }
}
