import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { ProcessPaymentDto } from "./dto/process-payment.dto";
import { PaymentResponseDto } from "./dto/payment-response.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("Payments")
@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("process")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Process a payment" })
  @ApiResponse({
    status: 200,
    description: "Payment processed successfully",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid payment details" })
  async processPayment(
    @Body() processPaymentDto: ProcessPaymentDto
  ): Promise<PaymentResponseDto> {
    return this.paymentService.processPayment(processPaymentDto);
  }

  @Post("verify")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify a payment" })
  @ApiResponse({ status: 200, description: "Payment verification result" })
  async verifyPayment(@Body("transactionId") transactionId: string) {
    return this.paymentService.verifyPayment(transactionId);
  }

  @Post("refund")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Process a refund" })
  @ApiResponse({
    status: 200,
    description: "Refund processed successfully",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid refund request" })
  async refundPayment(
    @Body("transactionId") transactionId: string,
    @Body("amount") amount?: number
  ): Promise<PaymentResponseDto> {
    return this.paymentService.refundPayment(transactionId, amount);
  }
}
