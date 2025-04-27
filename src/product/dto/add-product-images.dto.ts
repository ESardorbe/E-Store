import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from "class-validator"

export class AddProductImagesDto {
  @ApiProperty({
    example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    description: "Array of image URLs to add to the product",
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  images: string[]
}
