import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  // Foydalanuvchi ismi (majburiy)
  @Prop({ required: true, trim: true })
  firstName: string;

  // Familiyasi (ixtiyoriy)
  @Prop({ trim: true })
  lastName?: string;

  // Email
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // Xavfsiz parol
  @Prop({ required: true })
  password: string;

  // Email tekshirilganmi?
  @Prop({ default: false })
  isVerify: boolean;

  // Tasdiqlash kodi va muddati
  @Prop()
  verifyCode?: string;

  @Prop({ type: Date })
  verifyCodeExpiresAt?: Date | null;

  // Tokenlar
  @Prop()
  accessToken?: string;

  @Prop()
  refreshToken?: string;

  // Oxirgi kirgan vaqt (
  @Prop({ default: Date.now })
  lastLogin: Date;

  // Logout holati
  @Prop({ default: false })
  isLogOut: boolean;

  // Adminmi?
  @Prop({ type: String, enum: ["user", "admin"], default: "user" })
  role: string;

  // Profil rasmi
  @Prop({ trim: true })
  avatarUrl?: string;

  // Telefon raqami
  @Prop({ trim: true })
  phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
