import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNumber, IsOptional, IsEnum, IsCreditCard } from "class-validator"

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  PAYPAL = "paypal",
  APPLE_PAY = "apple_pay",
  GOOGLE_PAY = "google_pay",
}

export class ProcessPaymentDto {
  @ApiProperty({
    example: 100.5,
    description: "Total amount to charge",
  })
  @IsNumber()
  amount: number

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
    description: "Payment method to use",
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiProperty({
    example: "4111111111111111",
    description: "Credit card number (required for credit_card method)",
    required: false,
  })
  @IsOptional()
  @IsCreditCard()
  cardNumber?: string

  @ApiProperty({
    example: "12/24",
    description: "Card expiration date (required for credit_card method)",
    required: false,
  })
  @IsOptional()
  @IsString()
  cardExpiry?: string

  @ApiProperty({
    example: "123",
    description: "Card security code (required for credit_card method)",
    required: false,
  })
  @IsOptional()
  @IsString()
  cardCVC?: string

  @ApiProperty({
    example: "John Doe",
    description: "Cardholder name (required for credit_card method)",
    required: false,
  })
  @IsOptional()
  @IsString()
  cardholderName?: string

  @ApiProperty({
    example: "pay_123456789",
    description: "Payment token for digital wallets",
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentToken?: string
}
