import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyForgotPasswordOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 10)
  otp: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

