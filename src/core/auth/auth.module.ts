// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { UserService } from '../users/user.service';
// import { UserController } from '../users/user.controller';
// import { GoogleStrategy } from './google.strategy';
// import { Repository } from 'typeorm';
// import { User } from '../users/user.entities';
// import { AuthController } from './auth.controller';

// @Module({
//   imports: [
//     PassportModule,
//     JwtModule.register({
//       global: true, // ✅ makes it available everywhere

//       secret: process.env.MY_SECRET_KEY || 'default-secret',
//       signOptions: { expiresIn: '1d' }, // Token expiration time
//     }),
//   ],
//   controllers: [UserController, AuthController],
//   providers: [UserService, GoogleStrategy],
//   exports: [JwtModule],
// })
// export class AuthModule {}
