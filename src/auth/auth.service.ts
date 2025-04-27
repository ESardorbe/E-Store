import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { MailService } from "./mail.service";
import { JwtPayload } from "./jwt-payload.interface";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  // Foydalanuvchi ro'yxatdan o'tishi
  async register(registerDto: RegisterDto): Promise<any> {
    const { firstName, lastName, email, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new HttpException(
        "Foydalanuvchi allaqachon ro‘yxatdan o‘tgan!",
        HttpStatus.BAD_REQUEST
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = crypto.randomBytes(3).toString("hex");

    const newUser = new this.userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await newUser.save();

    // Tasdiqlash kodi yuborish
    await this.mailService.sendVerificationCode(email, verifyCode);

    return { message: "Foydalanuvchi yaratildi, emailni tekshiring!" };
  }

  // Login qilish
  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException("Noto‘g‘ri parol!", HttpStatus.BAD_REQUEST);
    }

    if (!user.isVerify) {
      throw new HttpException("Email tasdiqlanmagan!", HttpStatus.BAD_REQUEST);
    }

    const tokens = this.generateTokens(user);

    user.accessToken = tokens.accessToken;
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    user.isLogOut = false;
    await user.save();

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      message: "Muvaffaqiyatli tizimga kirildi",
    };
  }

  // Email tasdiqlash
  async verifyEmailCode(email: string, code: string): Promise<any> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    if (user.verifyCode !== code) {
      throw new HttpException(
        "Noto‘g‘ri tasdiqlash kodi!",
        HttpStatus.BAD_REQUEST
      );
    }

    if (user.verifyCodeExpiresAt && new Date() > user.verifyCodeExpiresAt) {
      throw new HttpException(
        "Tasdiqlash kodi muddati o‘tdi!",
        HttpStatus.BAD_REQUEST
      );
    }

    user.isVerify = true;
    user.verifyCode = "";
    user.verifyCodeExpiresAt = null;

    await user.save();

    return { message: "Email muvaffaqiyatli tasdiqlandi!" };
  }

  // Parolni tiklash
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    const { email } = resetPasswordDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    const resetCode = crypto.randomBytes(3).toString("hex");

    user.verifyCode = resetCode;
    user.verifyCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await this.mailService.sendResetPasswordCode(email, resetCode);

    return { message: "Parolni tiklash kodi yuborildi!" };
  }

  // Parolni yangilash
  async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<any> {
    const { email, verifyCode, newPassword } = updatePasswordDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new Error("Foydalanuvchi topilmadi!");
    }

    if (user.verifyCode !== verifyCode) {
      throw new Error("Noto‘g‘ri reset kodi!");
    }

    if (user.verifyCodeExpiresAt && new Date() > user.verifyCodeExpiresAt) {
      throw new Error("Kod muddati o‘tdi!");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verifyCode = "";
    user.verifyCodeExpiresAt = null;

    await user.save();

    return { message: "Parol muvaffaqiyatli yangilandi!" };
  }

  // LogOut qilish
  async logout(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });

    if (user.isLogOut) {
      throw new HttpException(
        "Foydalanuvchi allaqachon log out qilingan!",
        HttpStatus.BAD_REQUEST
      );
    }

    user.isLogOut = true;
    await user.save();
  }

  
  // Foydalanuvchini ID orqali topish
  async findUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }


    return user;
  }


  // Foydalanuvchilarni olish
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().select("-password -refreshToken");
  }

  // Token yaratish
  generateTokens(user: UserDocument) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user._id as JwtPayload["sub"],
      role: user.role,
      isVerify: user.isVerify,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "1h" });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    return { accessToken, refreshToken };
  }
}
