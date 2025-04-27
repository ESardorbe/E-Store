import { IsOptional, IsString, IsMongoId, IsNumber, Min, Max, IsEnum } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"

export enum SortOrder {
  NEWEST = "newest",
  PRICE_ASC = "price_asc",
  PRICE_DESC = "price_desc",
  NAME_ASC = "name_asc",
  NAME_DESC = "name_desc",
}

export class FilterProductDto {
  @ApiProperty({
    example: "60d21b4667d0d8992e610c85",
    description: "Filter by category ID",
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  category_id?: string

  @ApiProperty({
    example: "iphone",
    description: "Search term for product name or details",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty({
    enum: SortOrder,
    description: "Sort order for products",
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort?: SortOrder

  @ApiProperty({
    example: 100,
    description: "Minimum price filter",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number

  @ApiProperty({
    example: 1000,
    description: "Maximum price filter",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number

  @ApiProperty({
    example: 1,
    description: "Page number for pagination",
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number

  @ApiProperty({
    example: 10,
    description: "Number of items per page",
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc"
}
