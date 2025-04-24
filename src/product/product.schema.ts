// src/products/schemas/product.schema.ts
import { Schema, Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  category_id: string;
  newPrice: number;
  oldPrice: number;
  colour: string;
  memory?: string;
  screenSize?: string;
  cpu?: string;
  numberOfCores?: number;
  mainCamera?: string;
  frontCamera?: string;
  batteryCapacity?: number;
  details: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductSchema = new Schema<Product>({
  name: { type: String, required: true },
//   category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  newPrice: { type: Number, required: true },
  oldPrice: { type: Number, required: true },
  colour: { type: String, required: true },
  memory: { type: String },
  screenSize: { type: String },
  cpu: { type: String },
  numberOfCores: { type: Number },
  mainCamera: { type: String },
  frontCamera: { type: String },
  batteryCapacity: { type: Number },
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
