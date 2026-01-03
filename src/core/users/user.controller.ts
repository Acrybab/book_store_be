/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
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
