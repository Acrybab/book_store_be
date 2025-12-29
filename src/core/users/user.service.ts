/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entities';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import bcrypt from 'bcrypt';
import { ShippingAddress } from 'src/shippingAddress/entities/shippingAddress.entity';
import { MailService } from 'src/common/services/mail.service';
import { htmlContent } from 'src/common/services/htmlcontent';
import { SupabaseService } from 'src/book/service/supabase.service';
// import { Resend } from 'resend';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

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
      return {
        message: 'User already exists',
      };
    }
    const saltRounds = 10; // higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password || '', saltRounds);
    const shippingAddress = await this.shippingAddressRepository.findOne({
      where: { id: userEntity.shippingAddressId },
    });
    const user = this.userRepository.create({
      email: email,
      password: hashedPassword,
      name: name,
      shippingAddresses: shippingAddress ? [shippingAddress] : [],
      phoneNumber: userEntity.phoneNumber,
      avatar: userEntity.avatar,
      shippingAddressId: userEntity.shippingAddressId,
    });

    const payload = { sub: user.id, email: email || '' };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: process.env.MY_SECRET_KEY || 'default-secret',
    });
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILER_SEND!,
    });
    const sentForm = new Sender('info@test-r83ql3pjmezgzw1j.mlsender.net', 'Book Store');
    const recipient = [new Recipient(email as string)];
    const emailParams = new EmailParams()
      .setFrom(sentForm)
      .setTo(recipient)
      .setSubject('Welcome to Book Store!')
      .setHtml(htmlContent(email as string));

    await mailerSend.email.send(emailParams);
    await this.userRepository.save(user);

    return {
      data: {
        message: 'Sign Up Successful',
        user: {
          id: user.id,
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
      },
    };
  }
}
