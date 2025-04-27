import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsEnum, ValidateNested, IsBoolean } from "class-validator"
import { Type } from "class-transformer"
import { ProcessPaymentDto } from "../../payment/dto/process-payment.dto"

export enum DeliveryMethod {
  STANDARD = "standard",
  EXPRESS = "express",
  PICKUP = "pickup",
}

export class DeliveryDetailsDto {
  @ApiProperty({
    example: "Tashkent, Chilonzor district",
    description: "Shipping address for the order",
  })
  @IsString()
  address: string

  @ApiProperty({
    example: "Apartment 42",
    description: "Additional address details",
    required: false,
  })
  @IsOptional()
  @IsString()
  addressDetails?: string

  @ApiProperty({
    example: "100123",
    description: "Postal code",
    required: false,
  })
  @IsOptional()
  @IsString()
  postalCode?: string

  @ApiProperty({
    example: "Tashkent",
    description: "City",
  })
  @IsString()
  city: string

  @ApiProperty({
    example: "+998901234567",
    description: "Contact phone number for delivery",
  })
  @IsString()
  contactPhone: string

  @ApiProperty({
    enum: DeliveryMethod,
    example: DeliveryMethod.STANDARD,
    description: "Delivery method",
  })
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod
}

export class CreateOrderDto {
  @ApiProperty({
    type: DeliveryDetailsDto,
    description: "Delivery details",
  })
  @ValidateNested()
  @Type(() => DeliveryDetailsDto)
  deliveryDetails: DeliveryDetailsDto

  @ApiProperty({
    type: ProcessPaymentDto,
    description: "Payment details",
  })
  @ValidateNested()
  @Type(() => ProcessPaymentDto)
  paymentDetails: ProcessPaymentDto

  @ApiProperty({
    example: "Please deliver in the morning",
    description: "Additional notes for the order",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({
    example: true,
    description: "Whether to save delivery information for future orders",
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  saveDeliveryInfo?: boolean

  @IsString()
  @IsOptional()
  shippingAddress?: string

  @IsString()
  @IsOptional()
  paymentMethod?: string
}
