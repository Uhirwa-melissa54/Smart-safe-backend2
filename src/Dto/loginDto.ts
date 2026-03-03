import { IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

