import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from "class-validator"

export class CreateCategoryDto {
  @ApiProperty({
    example: "Smartphones",
    description: "Category name (must be unique)",
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    example: "Latest smartphones with advanced features",
    description: "Category description",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    example: true,
    description: "Whether the category is active",
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiProperty({
    example: "https://example.com/images/smartphones.jpg",
    description: "Category image URL",
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string

  @ApiProperty({
    example: 1,
    description: "Display order of the category",
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  order?: number
}
