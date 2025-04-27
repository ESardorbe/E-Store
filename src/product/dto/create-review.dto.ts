import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, IsArray } from "class-validator"

export class CreateReviewDto {
  @ApiProperty({
    example: 4,
    description: "Rating from 1 to 5 stars",
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number

  @ApiProperty({
    example: "Great product, very satisfied with the quality!",
    description: "Review comment",
  })
  @IsString()
  @IsNotEmpty()
  comment: string

  @ApiProperty({
    example: ["https://example.com/image1.jpg"],
    description: "Optional array of image URLs for the review",
    required: false,
  })
  @IsOptional()
  @IsArray()
  images?: string[]
}
