import { Test, TestingModule } from "@nestjs/testing";
import { PaymentService } from "../payment.service";
import { PaymentMethod } from "../dto/process-payment.dto";
import { PaymentStatus } from "../dto/payment-response.dto";

describe("PaymentService", () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("processPayment", () => {
    it("should process a valid credit card payment", async () => {
      // Arrange
      const paymentDetails = {
        amount: 100,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        cardNumber: "4111111111111111",
        cardExpiry: "12/24",
        cardCVC: "123",
        cardholderName: "John Doe",
      };

      // Act
      const result = await service.processPayment(paymentDetails);

      // Assert
      expect(result).toHaveProperty("transactionId");
      expect(result.transactionId).toMatch(/^pay_/);
      expect(result).toHaveProperty("status", PaymentStatus.COMPLETED);
      expect(result).toHaveProperty("amount", 100);
      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty(
        "message",
        "Payment processed successfully"
      );
    });

    it("should reject payment with suspicious amount", async () => {
      // Arrange
      const paymentDetails = {
        amount: 666,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        cardNumber: "4111111111111111",
        cardExpiry: "12/24",
        cardCVC: "123",
        cardholderName: "John Doe",
      };

      // Act & Assert
      await expect(
        service.processPayment(paymentDetails)
      ).resolves.toMatchObject({
        status: PaymentStatus.FAILED,
        message: expect.stringContaining("suspicious amount"),
      });
    });

    it("should throw an error when missing required credit card details", async () => {
      // Arrange
      const paymentDetails = {
        amount: 100,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        // Missing required fields
      };

      // Act & Assert
      await expect(service.processPayment(paymentDetails)).rejects.toThrow();
    });
  });

  describe("verifyPayment", () => {
    it("should verify a valid transaction ID", async () => {
      // Act
      const result = await service.verifyPayment("pay_12345abcde");

      // Assert
      expect(result).toEqual({ verified: true });
    });

    it("should reject an invalid transaction ID", async () => {
      // Act
      const result = await service.verifyPayment("invalid_id");

      // Assert
      expect(result).toEqual({ verified: false });
    });
  });
});
