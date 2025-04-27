import { Controller, Post, Body, UseGuards, Get, Put } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { GetCurrentUserId } from './decorator/get-current-user-id.decorator';
import { Roles } from './decorator/roles.decorator';
import { AdminGuard } from './guards/admin.guard';
import { Role } from './enums/role.enum';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Invalid username or password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify Email' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification code' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmailCode(verifyEmailDto.email, verifyEmailDto.verifyCode);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  @ApiResponse({ status: 200, description: 'Password reset code sent' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('update-password')
  @ApiOperation({ summary: 'Update Password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset code' })
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(updatePasswordDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(@GetCurrentUserId() userId: string) {
    await this.authService.logout(userId);
    return { message: 'Successfully logged out' };
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get Current User Profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  async getProfile(@GetCurrentUserId() userId: string) {
    return this.authService.findUserById(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Put('profile')
  @ApiOperation({ summary: 'Update User Profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@GetCurrentUserId() userId: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get All Users (Admin Only)' })
  @ApiOkResponse({ description: 'List of all users' })
  @Get('all-users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }
}
