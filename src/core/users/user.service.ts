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
    await this.mailService.sendHTMLEmail({
      to: email as string,
      subject: 'Welcome to Book Store!',
      htmlContent: htmlContent(email as string),
    });
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
}
