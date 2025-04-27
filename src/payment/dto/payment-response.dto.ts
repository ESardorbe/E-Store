import { ApiProperty } from "@nestjs/swagger"

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export class PaymentResponseDto {
  @ApiProperty({
    example: "pay_123456789",
    description: "Payment transaction ID",
  })
  transactionId: string

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
    description: "Status of the payment",
  })
  status: PaymentStatus

  @ApiProperty({
    example: 100.5,
    description: "Amount that was processed",
  })
  amount: number

  @ApiProperty({
    example: "2023-04-25T10:30:45Z",
    description: "Timestamp of when the payment was processed",
  })
  timestamp: string

  @ApiProperty({
    example: "Payment processed successfully",
    description: "Additional details about the payment",
  })
  message: string
}
