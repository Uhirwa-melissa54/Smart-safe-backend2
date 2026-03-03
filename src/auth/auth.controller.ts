import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { UserDto } from "src/Dto/UserDto";
import { AuthService } from "./auth.service";
import type { Response } from 'express';
import { CreateContactDto } from "src/Dto/createContactDto";
import { TrustedContactDto } from "src/Dto/contanctDto";
import { UpdateContactDto } from "src/Dto/updateContactDto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LoginDto } from "src/Dto/loginDto";
import { ForgotPasswordRequestDto, ResetPasswordDto, VerifyForgotPasswordOtpDto } from "src/Dto/forgotPasswordDto";

@Controller("auth")
export class AuthController{
    constructor(private authService: AuthService) {}
    @Post('signup')
    async signUp(@Body() user:UserDto, @Res({ passthrough: true }) res: Response,){
           const result = await this.authService.signUp(user);
        
    res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',      
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
      return {
    name: result.name,
    token: result.token,   
    status: result.status,
  };  
       

            
        }
    @Post('login')
    async login(@Body() user:LoginDto, @Res({ passthrough: true }) res: Response){
                   
          const result = await this.authService.login(user);          
    res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',      
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
      return {
    name: result.name,
    token: result.token,   
    status: result.status,
  };  

    }
    @Post('create-contact')
    @UseGuards(JwtAuthGuard)
    async createContact(@Body() contact:CreateContactDto,@Req() req){
        const userId = req.user.id;
      const result= await this.authService.createContacts(contact,userId);
      return result;
    }
  @Get('getContacts') 
  @UseGuards(JwtAuthGuard)
async getContacts(@Req() req): Promise<TrustedContactDto[]> { 
  const userId = req.user.id; // get logged-in user
  const result = await this.authService.getContacts(userId);
  return result.map(contact => ({
    id: contact.id,
    fullName: contact.fullName,
    relationship: contact.relationship,
    phoneNumber: contact.phoneNumber,
  }));
}
      @Patch('update/:id')
      @UseGuards(JwtAuthGuard)
  async updateContact(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ): Promise<TrustedContactDto> {
    const userId = req.user.id;
    const contactId = parseInt(id, 10);
    return this.authService.updateContact(userId, contactId, dto);
  }
   @Delete('delete/:id')
   @UseGuards(JwtAuthGuard)
  async deleteContact(@Req() req, @Param('id') id: string): Promise<{ message: string }> {
    const contactId = parseInt(id, 10);
    const userId = req.user.id;
    await this.authService.deleteContact(contactId,userId);
    return { message: 'Trusted contact deleted successfully' };
  }


   @Get('user/')
   @UseGuards(JwtAuthGuard)
  async getUser(@Req() req): Promise<any> {
    return await this.authService.getUserById(req.user.id);
    
  }
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED);
    }
    const result = await this.authService.refreshToken(refreshToken);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      token: result.token,
      status: result.status,
    };
  }

  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.authService.logout(refreshToken);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return result;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    return await this.authService.requestPasswordReset(dto.email);
  }

  @Post('forgot-password/verify')
  async verifyForgotPassword(@Body() dto: VerifyForgotPasswordOtpDto) {
    return await this.authService.verifyPasswordResetOtp(dto.email, dto.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto.resetToken, dto.newPassword);
  }

}
