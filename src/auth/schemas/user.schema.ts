import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  // Foydalanuvchi ismi (majburiy)
  @Prop({ required: true, trim: true })
  firstName: string

  // Familiyasi (ixtiyoriy)
  @Prop({ trim: true })
  lastName?: string

  // Email
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string

  // Xavfsiz parol
  @Prop({ required: true })
  password: string

  // Email tekshirilganmi?
  @Prop({ default: false })
  isVerify: boolean

  // Tasdiqlash kodi va muddati
  @Prop()
  verifyCode?: string

  @Prop({ type: Date })
  verifyCodeExpiresAt?: Date | null

  // Tokenlar
  @Prop()
  accessToken?: string

  @Prop()
  refreshToken?: string

  // Oxirgi kirgan vaqt (
  @Prop({ default: Date.now })
  lastLogin: Date

  // Logout holati
  @Prop({ default: false })
  isLogOut: boolean

  // Adminmi?
  @Prop({ type: String, enum: ["user", "admin"], default: "user" })
  role: string

  // Profil rasmi
  @Prop({ trim: true, default: "" })
  avatarUrl?: string

  // Telefon raqami
  @Prop({ trim: true })
  phone?: string

  // Yoqtirgan mahsulotlar
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Product" }], default: [] })
  likedProducts: MongooseSchema.Types.ObjectId[]

  // Savatcha
  @Prop({
    type: [
      {
        productId: { type: MongooseSchema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  cart: {
    productId: MongooseSchema.Types.ObjectId
    quantity: number
    addedAt: Date
  }[]

  // Sotib olingan mahsulotlar tarixi
  @Prop({
    type: [
      {
        products: [
          {
            productId: { type: MongooseSchema.Types.ObjectId, ref: "Product" },
            quantity: { type: Number, default: 1 },
            price: { type: Number, required: true },
          },
        ],
        totalAmount: { type: Number, required: true },
        orderDate: { type: Date, default: Date.now },
        status: { type: String, enum: ["pending", "processing", "shipped", "delivered"], default: "pending" },
      },
    ],
    default: [],
  })
  orders: {
    products: {
      productId: MongooseSchema.Types.ObjectId
      quantity: number
      price: number
    }[]
    totalAmount: number
    orderDate: Date
    status: string
  }[]
}

export const UserSchema = SchemaFactory.createForClass(User)
