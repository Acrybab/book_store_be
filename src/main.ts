import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ClassSerializerInterceptor } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['https://bookshop-trong-khang.vercel.app', 'http://localhost:3000'], // cho phép FE Next.js gọi
    credentials: true, // nếu bạn xài cookie/session
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  // app.enableCors({
  //   origin: 'http://localhost:3000', // cho phép FE Next.js gọi
  //   credentials: true, // nếu bạn xài cookie/session
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  // });
  // const filePath = path.join('D:\\LearnNestjs\\BookStore\\project-name\\uploads', photoName);

  app.useStaticAssets(join('D:\\LearnNestjs\\BookStore\\project-name\\uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
