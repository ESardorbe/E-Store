import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type ReviewDocument = Review & Document

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Product", required: true })
  productId: MongooseSchema.Types.ObjectId

  @Prop({ required: true, min: 1, max: 5 })
  rating: number

  @Prop({ required: true, trim: true })
  comment: string

  @Prop({ type: [String], default: [] })
  images: string[]

  @Prop({ default: true })
  isActive: boolean
}

export const ReviewSchema = SchemaFactory.createForClass(Review)

// Create a compound index to ensure a user can only review a product once
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true })
