import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import  { Document } from "mongoose"

export type CategoryDocument = Category & Document

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string

  @Prop({ trim: true })
  description?: string

  @Prop({ default: true })
  isActive: boolean

  @Prop({ trim: true })
  imageUrl?: string

  @Prop({ default: 0 })
  order: number
}

export const CategorySchema = SchemaFactory.createForClass(Category)
