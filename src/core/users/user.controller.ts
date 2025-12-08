/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, Header, Post, Request, Response, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreationDto, UserSignInDto } from './dto/UserCreation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/sign-up')
  @Header('Access-Control-Allow-Origin', 'http://localhost:3000')
  signUp(@Body(ValidationPipe) userCreationDto: UserCreationDto) {
    return this.userService.signUpWithEmailPassWord(userCreationDto);
  }
  @UseGuards(JwtAuthGuard) // bảo vệ route
  @Get('/me')
  getMe(@Request() req) {
    console.log('Request user:', req);
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
}
