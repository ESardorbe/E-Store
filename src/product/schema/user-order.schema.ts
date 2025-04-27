import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type UserOrderDocument = UserOrder & Document

@Schema({ timestamps: true })
export class UserOrder {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Order", required: true })
  orderId: MongooseSchema.Types.ObjectId

  @Prop({ default: false })
  isArchived: boolean
}

export const UserOrderSchema = SchemaFactory.createForClass(UserOrder)

// Create a compound index for user and order
UserOrderSchema.index({ userId: 1, orderId: 1 }, { unique: true })
