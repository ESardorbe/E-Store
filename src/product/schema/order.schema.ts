import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"
import { DeliveryMethod } from "../dto/create-order.dto"
import { PaymentMethod } from "../../payment/dto/process-payment.dto"
import { PaymentStatus } from "../../payment/dto/payment-response.dto"

export type OrderDocument = Order & Document

@Schema({ timestamps: true })
export class OrderProduct {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Product", required: true })
  productId: MongooseSchema.Types.ObjectId

  @Prop({ required: true, min: 1 })
  quantity: number

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ type: String, trim: true })
  productName?: string
}

@Schema({ timestamps: true })
export class DeliveryDetails {
  @Prop({ required: true, trim: true })
  address: string

  @Prop({ trim: true })
  addressDetails?: string

  @Prop({ trim: true })
  postalCode?: string

  @Prop({ required: true, trim: true })
  city: string

  @Prop({ required: true, trim: true })
  contactPhone: string

  @Prop({
    type: String,
    enum: [DeliveryMethod.STANDARD, DeliveryMethod.EXPRESS, DeliveryMethod.PICKUP],
    default: DeliveryMethod.STANDARD,
  })
  deliveryMethod: string
}

@Schema({ timestamps: true })
export class PaymentDetails {
  @Prop({
    type: String,
    enum: [PaymentMethod.CREDIT_CARD, PaymentMethod.PAYPAL, PaymentMethod.APPLE_PAY, PaymentMethod.GOOGLE_PAY],
    required: true,
  })
  paymentMethod: string

  @Prop({
    type: String,
    enum: [PaymentStatus.PENDING, PaymentStatus.COMPLETED, PaymentStatus.FAILED, PaymentStatus.REFUNDED],
    default: PaymentStatus.PENDING,
  })
  status: string

  @Prop({ trim: true })
  transactionId?: string

  @Prop()
  amount: number

  @Prop({ type: Date })
  processedAt?: Date
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId

  @Prop({ type: [OrderProduct], required: true })
  products: OrderProduct[]

  @Prop({ required: true, min: 0 })
  totalAmount: number

  @Prop({ type: DeliveryDetails, required: true })
  deliveryDetails: DeliveryDetails

  @Prop({ type: PaymentDetails, required: true })
  paymentDetails: PaymentDetails

  @Prop({
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  })
  status: string

  @Prop({ trim: true })
  notes?: string

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date })
  updatedAt: Date
}

export const OrderSchema = SchemaFactory.createForClass(Order)
