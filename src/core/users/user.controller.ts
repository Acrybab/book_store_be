/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Request,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ForgotPasswordDto, UserCreationDto, UserSignInDto } from './dto/UserCreation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './user.entities';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/sign-up')
  signUp(@Body(ValidationPipe) userCreationDto: UserCreationDto) {
    return this.userService.signUpWithEmailPassWord(userCreationDto);
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard) // bảo vệ route
  @Get('/me')
  getMe(@Request() req) {
    // console.log(req.user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.userService.getMe(req.user.userId);
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    return await this.userService.verifyEmail(token);
  }

  // @Post('resend-verification')
  // async resendVerificationEmail(@Body('email') email: string) {
  //   return await this.userService.resendVerificationEmail(email);
  // }

  @Post('forgot-password')
  async resetPasswordRequest(@Body() forgotPasswordDTO: ForgotPasswordDto) {
    return await this.userService.forgotPassword(forgotPasswordDTO);
  }
  @Post('reset-password')
  async changePassword(@Body() body: { token: string; oldPassword: string; newPassword: string }) {
    const { token, oldPassword, newPassword } = body;
    return await this.userService.resetPassword(token, oldPassword, newPassword);
  }
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/sign-in')
  async signIn(@Body(ValidationPipe) userSignInDto: UserSignInDto) {
    return this.userService.signInWithEmailPassword(userSignInDto.email, userSignInDto.password);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard) // ✅ Guard chạy trước
  updateUser(@Body() userUpdateDto: Partial<User>, @Req() req) {
    return this.userService.updateMyProfile(req.user.userId, userUpdateDto);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('userPhoto'))
  updateAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.userService.updateAvatar(req.user.userId, file);
  }
}
