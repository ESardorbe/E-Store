import { IsString, IsNumber, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class AddToCartDto {
  @ApiProperty({
    example: "60d21b4667d0d8992e610c85",
    description: "Product ID to add to cart",
  })
  @IsString()
  productId: string

  @ApiProperty({
    example: 1,
    description: "Quantity of product to add (minimum 1)",
  })
  @IsNumber()
  @Min(1)
  quantity: number
}
