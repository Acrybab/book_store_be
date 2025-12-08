/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entities';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import nodemailer from 'nodemailer';

import bcrypt from 'bcrypt';
import { ShippingAddress } from 'src/shippingAddress/entities/shippingAddress.entity';

type SignUpParams = {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ShippingAddress)
    private shippingAddressRepository: Repository<ShippingAddress>,
  ) {}

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    return user;
  }

  async getAllUsers() {
    return await this.userRepository.find({
      relations: ['cartItems', 'ratings', 'shippingAddresses'],
    });
  }

  async signUpWithEmailPassWord(userEntity: Partial<User>) {
    const { email, password, name } = userEntity;

    const userExists = await this.findUserByEmail(email || '');
    if (userExists) {
      return 'User already exists';
    }
    const saltRounds = 10; // higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password || '', saltRounds);
    const shippingAddress = await this.shippingAddressRepository.findOne({
      where: { id: userEntity.shippingAddressId },
    });
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      shippingAddresses: shippingAddress ? [shippingAddress] : [],
      phoneNumber: userEntity.phoneNumber,
      avatar: userEntity.avatar,
      shippingAddressId: userEntity.shippingAddressId,
    });
    await this.userRepository.save(user);

    const payload = { sub: user.id, email: email || '' };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: process.env.MY_SECRET_KEY || 'default-secret',
    });
    await this.sendEmail(user.email);
    return {
      data: {
        message: 'Sign Up Successful',
        user: {
          email: user.email,
          userName: user.name,
        },
        accessToken: token,
      },
    };
  }

  async createUser(user: Partial<User>) {
    const { email, name } = user;

    const newUser = this.userRepository.create({
      email,
      name,
    });

    await this.userRepository.save(newUser);
  }

  async handleSignUpWithGoogle(signUpParams: SignUpParams) {
    const existingUser = await this.userRepository.findOne({
      where: { email: signUpParams.email },
    });
    if (existingUser) {
      return existingUser;
    }
    const { password, ...otherParams } = signUpParams;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      ...otherParams,
      password: hashedPassword,
    });

    const createdUser = await this.userRepository.save(newUser);
    return createdUser;
  }

  findById(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async handleSignInWithUserId(req) {
    if (!req.user) {
      throw new Error('User not found');
    }

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await this.findUserByEmail(req.user.email);

    if (!existingUser) {
      await this.createUser({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        password: '',
      });
    }

    return {
      message: 'User Info from google',
      user: req.user,
    };
  }

  async signInWithEmailPassword(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: process.env.MY_SECRET_KEY || 'my-super-secret-key',
    });

    return {
      data: {
        message: 'Sign In Successful',
        user: {
          id: user.id,
          email: user.email,
          userName: user.name,
        },
        accessToken: token,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cartItems', 'ratings'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async sendEmail(email: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'trongkhangtn08032003@gmail.com',
        pass: 'ganw wmve rkjy hysy',
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Chào mừng bạn đến với chúng tôi!',
      html: `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào mừng!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">
                                Chào mừng bạn!
                            </h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                Cảm ơn bạn đã tham gia cùng chúng tôi
                            </p>
                        </div>

                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
    <div style="color: white; font-size: 36px; line-height: 1; display: flex; align-items: center; justify-content: center;">✓</div>
</div>
                                <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 400;">
                                    Đăng ký thành công!
                                </h2>
                                <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
                                    Tài khoản của bạn đã được tạo thành công. Chúng tôi rất vui mừng được chào đón bạn vào cộng đồng của chúng tôi.
                                </p>
                            </div>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: 500; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">
                                    Bắt đầu ngay
                                </a>
                            </div>

                            <!-- Features -->
                            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0;">
                                <h3 style="color: #333333; margin: 0 0 20px 0; font-size: 18px; text-align: center;">
                                    Những gì bạn có thể làm:
                                </h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                                    <div style="flex: 1; min-width: 150px; text-align: center; padding: 10px;">
                                        <div style="color: #667eea; font-size: 24px; margin-bottom: 10px;">🚀</div>
                                        <p style="color: #666666; margin: 0; font-size: 14px;">Trải nghiệm tuyệt vời</p>
                                    </div>
                                    <div style="flex: 1; min-width: 150px; text-align: center; padding: 10px;">
                                        <div style="color: #667eea; font-size: 24px; margin-bottom: 10px;">🎯</div>
                                        <p style="color: #666666; margin: 0; font-size: 14px;">Tính năng độc quyền</p>
                                    </div>
                                    <div style="flex: 1; min-width: 150px; text-align: center; padding: 10px;">
                                        <div style="color: #667eea; font-size: 24px; margin-bottom: 10px;">💬</div>
                                        <p style="color: #666666; margin: 0; font-size: 14px;">Hỗ trợ 24/7</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Contact Info -->
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #999999; margin: 0; font-size: 14px;">
                                    Có câu hỏi? <a href="mailto:support@example.com" style="color: #667eea; text-decoration: none;">Liên hệ với chúng tôi</a>
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="color: #999999; margin: 0 0 10px 0; font-size: 12px;">
                                © 2025 Công ty của bạn. Tất cả quyền được bảo lưu.
                            </p>
                            <div style="margin-top: 15px;">
                                <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 12px;">Chính sách bảo mật</a>
                                <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 12px;">Điều khoản sử dụng</a>
                                <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 12px;">Hủy đăng ký</a>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `,
    });
  }
}
