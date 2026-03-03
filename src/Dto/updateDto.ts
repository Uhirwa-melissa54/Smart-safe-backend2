
import { IsString, IsNotEmpty, IsPhoneNumber, MinLength } from 'class-validator';

export class UpdateDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsPhoneNumber() 
  @IsNotEmpty()
  phoneNumber: string;
}
