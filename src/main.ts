import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
console.log(process.env.DATABASE_URL);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.use(cookieParser());
   app.useGlobalPipes(
     new ValidationPipe({
       whitelist: true,
       forbidNonWhitelisted: true,
       transform: true,
     }),
   );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
