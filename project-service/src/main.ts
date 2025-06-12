import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser'; // Thêm cookie-parser cho JWT

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Cấu hình middleware
  app.use(cookieParser()); // Phân tích cookie cho JWT
  app.use(passport.initialize()); // Khởi tạo Passport (không dùng session)
  app.use(
    cors({
      origin: 'http://localhost:3000', // Frontend URL
      credentials: true, // Cho phép gửi cookie
    }),
  );

  app.useGlobalPipes(new ValidationPipe()); // Áp dụng validation pipe

  await app.listen(process.env.PORT ?? 3001);
  console.log('Server running on port', process.env.PORT ?? 3001);
}
bootstrap();