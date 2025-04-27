import { Injectable, BadRequestException } from "@nestjs/common";
import * as crypto from "crypto";
import { ProcessPaymentDto, PaymentMethod } from "./dto/process-payment.dto";
import { PaymentResponseDto, PaymentStatus } from "./dto/payment-response.dto";

@Injectable()
export class PaymentService {
  async processPayment(
    paymentDetails: ProcessPaymentDto
  ): Promise<PaymentResponseDto> {
    this.validatePaymentDetails(paymentDetails);

    const simulationResult = this.simulatePaymentProcessing(paymentDetails);

    const transactionId = `pay_${crypto.randomBytes(8).toString("hex")}`;

    return {
      transactionId,
      status: simulationResult.success
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED,
      amount: paymentDetails.amount,
      timestamp: new Date().toISOString(),
      message: simulationResult.message,
    };
  }

  private validatePaymentDetails(paymentDetails: ProcessPaymentDto): void {
    const {
      paymentMethod,
      cardNumber,
      cardExpiry,
      cardCVC,
      cardholderName,
      paymentToken,
    } = paymentDetails;

    if (paymentMethod === PaymentMethod.CREDIT_CARD) {
      if (!cardNumber || !cardExpiry || !cardCVC || !cardholderName) {
        throw new BadRequestException(
          "Kredit karta to'lovlari uchun karta raqami, amal qilish muddati, CVC va karta egasining ismi talab qilinadi"
        );
      }
    } else if (
      [
        PaymentMethod.PAYPAL,
        PaymentMethod.APPLE_PAY,
        PaymentMethod.GOOGLE_PAY,
      ].includes(paymentMethod) &&
      !paymentToken
    ) {
      throw new BadRequestException(
        `${paymentMethod} to'lovlar to'lov belgisini talab qiladi`
      );
    }
  }

  private simulatePaymentProcessing(paymentDetails: ProcessPaymentDto): {
    success: boolean;
    message: string;
  } {
    if (paymentDetails.amount === 666) {
      return {
        success: false,
        message: "Payment declined: suspicious amount",
      };
    }

    if (paymentDetails.amount > 10000) {
      return {
        success: false,
        message: "Payment failed: amount exceeds permitted limit",
      };
    }

    if (paymentDetails.cardNumber === "4242424242424241") {
      return {
        success: false,
        message: "Payment failed: invalid card number",
      };
    }

    return {
      success: true,
      message: "Payment processed successfully",
    };
  }

  async verifyPayment(transactionId: string): Promise<{ verified: boolean }> {
    return { verified: !!transactionId && transactionId.startsWith("pay_") };
  }

  async refundPayment(
    transactionId: string,
    amount?: number
  ): Promise<PaymentResponseDto> {
    if (!transactionId || !transactionId.startsWith("pay_")) {
      throw new BadRequestException("Invalid transaction ID");
    }

    return {
      transactionId: `ref_${crypto.randomBytes(8).toString("hex")}`,
      status: PaymentStatus.REFUNDED,
      amount: amount || 0,
      timestamp: new Date().toISOString(),
      message: "Refund processed successfully",
    };
  }
}
