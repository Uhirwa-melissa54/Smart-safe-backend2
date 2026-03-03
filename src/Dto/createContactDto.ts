import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;

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
