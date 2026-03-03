import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  relationship?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  district?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sector?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cell?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  village?: string;
}

