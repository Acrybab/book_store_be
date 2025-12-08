/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { User } from '../users/user.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../users/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }
  validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): any {
    const { name, emails } = profile;
    const user = {
      email: emails?.[0]?.value ?? '',
      firstName: name?.givenName ?? '',
      lastName: name?.familyName ?? '',
      accessToken,
    };

    done(null, user);
  }

  // async validate(
  //   accessToken: string,
  //   refreshToken: string,
  //     name?: { givenName?: string; familyName?: string };
  //     emails?: Array<{ value: string }>;
  //   },
  //   done: VerifyCallback,
  // ) {
  //   const { name, emails } = profile;

  //   const user = {
  //     email: emails?.[0]?.value ?? '',
  //     firstName: name?.givenName ?? '',
  //     lastName: name?.familyName ?? '',
  //   };

  //   const userInDB = await this.userService.findUserByEmail(user.email);

  //   if (userInDB) {
  //     return done(null, userInDB);
  //   }

  //   const createdUser = await this.userService.handleSignUpWithGoogle({
  //     email: user.email,
  //     password: '',
  //     name: `${user.firstName} ${user.lastName}`,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //   });
  //   console.log(createdUser, 'sssss');

  //   return done(null, createdUser);
  // }
}
