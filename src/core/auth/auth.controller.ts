/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, Header, Request, Response, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JwtService } from '@nestjs/jwt';

import { UserService } from '../users/user.service';
interface GoogleUser {
  user: {
    id: number;
    email: string;
    name: string;
  };
}
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {} // private readonly userService: UserService, // private readonly jwtService: JwtService,
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @Header('Access-Control-Allow-Origin', 'https://bookshop-trong-khang.vercel.app')
  @Header('Access-Control-Allow-Credentials', 'true')
  @Header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  googleAuth() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent('https://bookstore-production-e49f.up.railway.app/auth/google/callback');
    const scope = encodeURIComponent('email profile');
    const url = encodeURIComponent(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`,
    );
    return { url };
    // Chỗ này Passport sẽ tự redirect sang Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req: GoogleUser, @Response() res) {
    const signInData = await this.userService.handleSignInWithUserId(req);

    res.cookie('book_token', signInData.user.accessToken, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: true, // Ensures the cookie is sent only over HTTPS in production
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    return res.redirect('http://localhost:3000/');
  }

  // @Get('sign-in')
  // async signIn(@Request() req: GoogleUser, @Response() res) {
  //   const signInData = await this.userService.handleSignInWithUserId(req);
  //   res.cookie('book_token', signInData.user.accessToken, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'none',
  //     maxAge: 24 * 60 * 60 * 1000,
  //   });
  //   return res.json(signInData);
  // }

  // Sau khi Google redirect lại, thông tin user sẽ ở req.user
}
