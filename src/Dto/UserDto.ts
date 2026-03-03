
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsPhoneNumber() 
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  sector: string;

  @IsString()
  @IsNotEmpty()
  cell: string;

  @IsString()
  @IsNotEmpty()
  village: string;
}
