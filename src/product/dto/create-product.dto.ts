import { IsString, IsNumber, IsOptional, IsMongoId } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty({
    description: "The name of the product",
    example: "Smartphone XYZ",
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The MongoDB ObjectId of the product category",
    example: "507f1f77bcf86cd799439011",
    type: String,
  })
  @IsMongoId()
  category_id: string;

  @ApiProperty({
    description: "The URL of the product's main image",
    example: "http://example.com/images/product.jpg",
    type: String,
  })
  @IsString()
  imageUrl: string;

  @ApiProperty({
    description: "The original price of the product",
    example: 999.99,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: "The discounted price of the product",
    example: 799.99,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  newPrice?: number;

  @ApiProperty({
    description: "The previous price of the product before discount",
    example: 1099.99,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  oldPrice?: number;

  @ApiProperty({
    description: "The colour of the product",
    example: "Blue",
    type: String,
  })
  @IsString()
  colour: string;

  @ApiProperty({
    description: "The memory capacity of the product",
    example: "128GB",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  memory?: string;

  @ApiProperty({
    description: "The screen size of the product",
    example: "6.5 inches",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  screenSize?: string;

  @ApiProperty({
    description: "The CPU specification of the product",
    example: "Octa-core 2.4 GHz",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  cpu?: string;

  @ApiProperty({
    description: "The number of CPU cores",
    example: 8,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  numberOfCores?: number;

  @ApiProperty({
    description: "The main camera specification",
    example: "48MP",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  mainCamera?: string;

  @ApiProperty({
    description: "The front camera specification",
    example: "12MP",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  frontCamera?: string;

  @ApiProperty({
    description: "The battery capacity in mAh",
    example: 4000,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  batteryCapacity?: number;

  @ApiProperty({
    description: "Detailed description of the product",
    example: "A high-performance smartphone with advanced features.",
    type: String,
  })
  @IsString()
  details: string;
}