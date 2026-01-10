/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Body, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entities';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import bcrypt from 'bcrypt';
// import { ShippingAddress } from 'src/shippingAddress/entities/shippingAddress.entity';
// import { MailService } from 'src/common/services/mail.service';
// import { htmlContent } from 'src/common/services/htmlcontent';
import { SupabaseService } from 'src/book/service/supabase.service';
import { MailService } from 'src/common/services/mail.service';
import { htmlContent } from 'src/common/services/htmlcontent';
import { access } from 'fs';
import { ForgotPasswordDto } from './dto/UserCreation.dto';
// import { Resend } from 'resend';
// import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

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
    private readonly mailService: MailService,
    private readonly supabaseService: SupabaseService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // @InjectRepository(ShippingAddress)
    // private shippingAddressRepository: Repository<ShippingAddress>,
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
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password || '', 10);

    // Tạo user với trạng thái isVerified = false
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      isVerified: false,
    });
    await this.userRepository.save(user); // Lưu trước để có ID

    // Tạo token xác thực (dùng JWT hoặc chuỗi ngẫu nhiên)
    const verifyToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: '1h', secret: process.env.MY_SECRET_KEY },
    );

    const verificationUrl = `https://bookshop-trong-khang.vercel.app/verify-email?token=${verifyToken}`;

    await this.mailService.sendHTMLEmail({
      to: email || '',
      subject: '📚 [Book Store] Xác thực tài khoản của bạn',
      htmlContent: `
      <h2>Chào mừng ${name}!</h2>
      <p>Vui lòng click vào nút bên dưới để kích hoạt tài khoản:</p>
      <a href="${verificationUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xác thực ngay</a>
      <p>Link này sẽ hết hạn sau 1 giờ.</p>
    `,
    });

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          userName: user.name,
        },
        accessToken: verifyToken,
      },
    };
  }

  async verifyEmail(token: string) {
    try {
      // 1. Giải mã token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.MY_SECRET_KEY,
      });

      // 2. Tìm user
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) throw new BadRequestException('Người dùng không tồn tại');

      if (user.isVerified) {
        return { message: 'Tài khoản đã được xác thực từ trước.' };
      }

      // 3. Cập nhật trạng thái
      user.isVerified = true;
      await this.userRepository.save(user);

      return {
        message: 'Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.',
      };
    } catch (error) {
      throw new BadRequestException('Link xác nhận không hợp lệ hoặc đã hết hạn.');
    }
  }

  async createUser(user: Partial<User>) {
    const { email, name } = user;

    const newUser = this.userRepository.create({
      email,
      name,
    });

    await this.userRepository.save(newUser);
  }

  async forgotPassword(forgotPassword: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email: forgotPassword.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: '1h', secret: process.env.MY_SECRET_KEY },
    );

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    await this.mailService.sendHTMLEmail({
      to: forgotPassword.email,
      subject: '📚 [Book Store] Đặt lại mật khẩu của bạn',
      htmlContent: `
      <h2>Xin chào ${user.name}!</h2>
      <p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
      <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
      <p>Link này sẽ hết hạn sau 1 giờ.</p>
    `,
    });

    return {
      message: 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến của bạn.',
    };
  }

  async resetPassword(token: string, oldPassword: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.MY_SECRET_KEY,
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) throw new NotFoundException('User not found');

      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new UnauthorizedException('Old password is incorrect');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await this.userRepository.save(user);

      return {
        message: 'Mật khẩu đã được đặt lại thành công.',
      };
    } catch (error) {
      throw new BadRequestException('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }
  }

  async updateMyProfile(userId: number, userUpdateDto: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = this.userRepository.merge(user, {
      ...userUpdateDto,
    });

    await this.userRepository.save(updatedUser);

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  async updateAvatar(userId: number, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return {
        message: 'User not found',
      };
    }

    const url = await this.supabaseService.uploadFile(
      'book_store',
      `${Date.now()}_${file.originalname}`,
      file.buffer,
      file.mimetype,
    );
    user.avatar = url;

    await this.userRepository.save(user);
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

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before signing in.');
    }
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
          avatar: user.avatar,
        },
        accessToken: token,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cartItems', 'ratings', 'shippingAddresses', 'favorites'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: ' User profile fetched successfully',
      data: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        favorites: user.favorites,
        shippingAddresses: user.shippingAddresses,
      },
    };
  }
}
