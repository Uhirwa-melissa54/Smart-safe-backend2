import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { UserDto } from "src/Dto/UserDto";
import { PrismaService } from "src/prisma/prisma.service";
import { SignUp } from "src/Dto/signUpDto";
import { CreateContactDto } from "src/Dto/createContactDto";
import { TrustedContactDto } from "src/Dto/contanctDto";
import { UpdateContactDto } from "src/Dto/updateContactDto";
import { MailService } from "./mail.service";

@Injectable()
export class AuthService{
 constructor(
  private prisma:PrismaService,
  private jwtService:JwtService,
  private mailService: MailService,
 ){

}

  private accessSecret() {
    return process.env.JWT_SECRET || 'access-token';
  }

  private refreshSecret() {
    return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refresh-secret';
  }

  private resetSecret() {
    return process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'reset-secret';
  }

  private signAccessToken(userId: number, firstName?: string) {
    return this.jwtService.sign(
      { sub: userId, firstName },
      { secret: this.accessSecret(), expiresIn: '15m' },
    );
  }

  private signRefreshToken(userId: number) {
    return this.jwtService.sign(
      { sub: userId },
      { secret: this.refreshSecret(), expiresIn: '7d' },
    );
  }

  private signPasswordResetToken(userId: number) {
    return this.jwtService.sign(
      { sub: userId, purpose: 'password-reset' },
      { secret: this.resetSecret(), expiresIn: '15m' },
    );
  }

  private async storeRefreshTokenHash(userId: number, refreshToken: string) {
    const refreshTokenHash = await argon2.hash(refreshToken, { type: argon2.argon2id });
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }
    async signUp(user:UserDto) :Promise<SignUp>{
      try{
        const hashedPassword = await argon2.hash(user.password, { type: argon2.argon2id });
          const createdUser=await this.prisma.user.create({
            data:{
                firstName:user.firstName,
                lastName:user.lastName,
                password:hashedPassword,
                phoneNumber:user.phoneNumber,
               
                district: user.district,
                sector: user.sector,
                cell: user.cell,
                village: user.village,

            }
        
    })
    
   
        const accessToken = this.signAccessToken(createdUser.id, createdUser.firstName);
        const refreshToken = this.signRefreshToken(createdUser.id);
        await this.storeRefreshTokenHash(createdUser.id, refreshToken);


    return {
        name:createdUser.firstName,
        token:accessToken,
        refreshToken:refreshToken,
        status:"201"
   
  }
}
 
    catch (error) {
    
    if (error.code === 'P2002') {
      throw new ConflictException('Account already exists');
    }

    throw new InternalServerErrorException('Failed to create user');
  }


    
}
        
    
     async login(user: { phoneNumber: string; password: string }): Promise<SignUp> {
   
    const foundUser = await this.prisma.user.findUnique({
      where: { phoneNumber: user.phoneNumber },
    });

    if (!foundUser) {
      throw new UnauthorizedException("User not found");
    }

    
    const isPasswordValid = await argon2.verify(foundUser.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

  
    const accessToken = this.signAccessToken(foundUser.id, foundUser.firstName);
    const refreshToken = this.signRefreshToken(foundUser.id);
    await this.storeRefreshTokenHash(foundUser.id, refreshToken);

   return {
        name:foundUser.firstName,
        token:accessToken,
        refreshToken:refreshToken,
        status:"201"
   
  };
  }

  async createContacts(contact: CreateContactDto,user_id: number) {
    try {
      const createdContact = await this.prisma.trustedContacts.create({
        data: {
          fullName: contact.fullName,
          phoneNumber: contact.phoneNumber,
          relationship: contact.relationship,
          district: contact.district,
          sector: contact.sector,
          cell: contact.cell,
          village: contact.village,
          userId: user_id,
        },
      });
      return createdContact;
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Contact phone number already exists');
      }
      throw new InternalServerErrorException('Failed to create contact');
    }
  }
 async getContacts(userId: number) {
  return await this.prisma.trustedContacts.findMany({
    where: {
      userId: userId, // filter contacts by this user
    },
  });
}
  async deleteContact(contactId:number,userId: number): Promise<void> {
    const deleted = await this.prisma.trustedContacts.deleteMany({
      where: { id: contactId, userId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Trusted contact not found');
    }
  }

async updateContact(userId: number, contactId: number, dto: UpdateContactDto): Promise<TrustedContactDto> {
  
  const contact = await this.prisma.trustedContacts.findFirst({
    where: { id: contactId, userId },
  });

  if (!contact) {
    throw new NotFoundException('Trusted contact not found for this user');
  }

  
  const updated = await this.prisma.trustedContacts.update({
    where: { id: contactId },
    data: { ...dto },
  });

  return {
    id: updated.id,
    fullName: updated.fullName,
    relationship: updated.relationship,
    phoneNumber: updated.phoneNumber,
  };
}

  async getUserById(userId: number): Promise<any> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      district: true,
      sector: true,
      cell: true,
      village: true,
      createAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    district: user.district,
    sector: user.sector,
    cell: user.cell,
    village: user.village,
    createdAt: user.createAt,
    updatedAt: user.updatedAt,
  };
}


  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string; status: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret(),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.refreshTokenHash) {
        throw new UnauthorizedException('Logged out');
      }

      const isRefreshValid = await argon2.verify(user.refreshTokenHash, refreshToken);
      if (!isRefreshValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.signAccessToken(user.id, user.firstName);
      const newRefreshToken = this.signRefreshToken(user.id);
      await this.storeRefreshTokenHash(user.id, newRefreshToken);

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        status: '200',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) {
      try {
        const decoded = this.jwtService.verify(refreshToken, { secret: this.refreshSecret() });
        const userId = decoded?.sub;
        if (typeof userId === 'number') {
          await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null },
          });
        }
      } catch {
        // ignore invalid/expired tokens; we still clear cookies at controller level
      }
    }
    return { message: 'Logged out' };
  }

  private generateOtp(length = 6) {
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Avoid leaking whether the email exists.
    if (!user) {
      return { message: 'If that email exists, an OTP was sent.' };
    }

    const otp = this.generateOtp(6);
    const otpHash = await argon2.hash(otp, { type: argon2.argon2id });
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.passwordResetOtp.create({
      data: {
        otpHash,
        expiresAt,
        userId: user.id,
      },
    });

    await this.mailService.sendPasswordResetOtp(email, otp);
    return { message: 'If that email exists, an OTP was sent.' };
  }

  async verifyPasswordResetOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const latest = await this.prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (latest.attempts >= 5) {
      throw new UnauthorizedException('Too many attempts. Request a new OTP.');
    }

    const isValid = await argon2.verify(latest.otpHash, otp);
    if (!isValid) {
      await this.prisma.passwordResetOtp.update({
        where: { id: latest.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.passwordResetOtp.update({
      where: { id: latest.id },
      data: { consumedAt: new Date() },
    });

    return { resetToken: this.signPasswordResetToken(user.id) };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    let decoded: any;
    try {
      decoded = this.jwtService.verify(resetToken, { secret: this.resetSecret() });
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (decoded?.purpose !== 'password-reset' || typeof decoded?.sub !== 'number') {
      throw new UnauthorizedException('Invalid reset token');
    }

    const hashedPassword = await argon2.hash(newPassword, { type: argon2.argon2id });
    await this.prisma.user.update({
      where: { id: decoded.sub },
      data: { password: hashedPassword, refreshTokenHash: null },
    });

    return { message: 'Password updated successfully' };
  }

}