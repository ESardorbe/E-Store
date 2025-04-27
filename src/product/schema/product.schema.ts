import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type ProductDocument = Product & Document

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Category", required: true })
  category_id: MongooseSchema.Types.ObjectId

  @Prop({ required: true, trim: true })
  imageUrl?: string

  @Prop({ type: [String], default: [] })
  additionalImages: string[]

  @Prop({})
  price?: number

  @Prop({})
  newPrice?: number

  @Prop({})
  oldPrice?: number

  @Prop({ required: true, trim: true })
  colour: string

  @Prop({ trim: true })
  memory?: string

  @Prop({ trim: true })
  screenSize?: string

  @Prop({ trim: true })
  cpu?: string

  @Prop()
  numberOfCores?: number

  @Prop({ trim: true })
  mainCamera?: string

  @Prop({ trim: true })
  frontCamera?: string

  @Prop()
  batteryCapacity?: number

  @Prop({ required: true, trim: true })
  details: string

  // Virtual fields for reviews (not stored in DB)
  averageRating?: number
  reviewCount?: number
}

export const ProductSchema = SchemaFactory.createForClass(Product)
