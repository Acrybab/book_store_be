/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Header,
  Patch,
  Post,
  Req,
  Request,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreationDto, UserSignInDto } from './dto/UserCreation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './user.entities';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/sign-up')
  @Header('Access-Control-Allow-Origin', 'http://localhost:3000')
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

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/sign-in')
  async signIn(@Body(ValidationPipe) userSignInDto: UserSignInDto) {
    // const signInData = await this.userService.handleSignInWithUserId(req);

    // res.cookie('book_token', signInData.user.accessToken, {
    //   httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    //   secure: true, // Ensures the cookie is sent only over HTTPS in production
    //   sameSite: 'none',
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    // });
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
