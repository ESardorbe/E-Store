import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { AccessTokenGuard } from "./guards/access-token.guard";
import { GetCurrentUserId } from "./decorator/get-current-user-id.decorator";
import { Roles } from "./decorator/roles.decorator";
import { AdminGuard } from "./guards/admin.guard";
import { Role } from "./enums/role.enum";

@ApiTags("Authentication")
@ApiBearerAuth()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Foydalanuvchi ro'yxatdan o'tishi
  @Post("register")
  @ApiOperation({ summary: "Register" })
  @ApiResponse({
    status: 201,
    description: "Foydalanuvchi muvaffaqiyatli yaratildi",
  })
  @ApiResponse({ status: 400, description: "Noto‘g‘ri ma‘lumotlar" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Foydalanuvchi tizimga kirishi
  @Post("login")
  @ApiOperation({ summary: "Login" })
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi tizimga muvaffaqiyatli kirdi",
  })
  @ApiResponse({
    status: 400,
    description: "Foydalanuvchi topilmadi yoki parol noto‘g‘ri",
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Email tasdiqlash
  @Post("verify-email")
  @ApiOperation({ summary: "Email tasdiqlash" })
  @ApiResponse({ status: 200, description: "Email tasdiqlandi" })
  @ApiResponse({
    status: 400,
    description: "Tasdiqlash kodi noto‘g‘ri yoki muddati o‘tdi",
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmailCode(
      verifyEmailDto.email,
      verifyEmailDto.verifyCode
    );
  }

  // Parolni tiklash
  @Post("reset-password")
  @ApiOperation({ summary: "Parolni tiklash" })
  @ApiResponse({ status: 200, description: "Parolni tiklash kodi yuborildi" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Parolni yangilash
  @Post("update-password")
  @ApiOperation({ summary: "Parolni yangilash" })
  @ApiResponse({ status: 200, description: "Parol muvaffaqiyatli yangilandi" })
  @ApiResponse({
    status: 400,
    description: "Reset kodi noto‘g‘ri yoki muddati o‘tdi",
  })
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(updatePasswordDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post("logout")
  @ApiOperation({ summary: "Foydalanuvchi tizimdan chiqishi" })
  @ApiResponse({ status: 200, description: "Tizimdan muvaffaqiyatli chiqdi" })
  async logout(@GetCurrentUserId() userId: string) {
    await this.authService.logout(userId);
    return { message: "Tizimdan muvaffaqiyatli chiqdi" };
  }

  @UseGuards(AccessTokenGuard)
  @Get("profile")
  @ApiOperation({ summary: "Joriy foydalanuvchi profilini olish" })
  @ApiResponse({ status: 200, description: "Foydalanuvchi profili qaytarildi" })
  async getProfile(@GetCurrentUserId() userId: string) {
    return this.authService.findUserById(userId);
  }

  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Barcha foydalanuvchilarni olish (faqat administrator)" })
  @ApiOkResponse({ description: "Barcha foydalanuvchilar ro'yxati" })
  @Get("all-users")
  getAllUsers() {
    return this.authService.getAllUsers();
  }
}
