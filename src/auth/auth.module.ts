import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { MailService } from './mail.service';


@Module({
     imports:[PrismaModule, PassportModule, JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    })],
    providers:[AuthService, JwtStrategy, MailService],
    controllers:[AuthController]
})
export class AuthModule {
   
}
