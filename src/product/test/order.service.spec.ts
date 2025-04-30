import { Test, TestingModule } from "@nestjs/testing";
import { OrderService } from "../order.service";
import { PaymentService } from "../../payment/payment.service";
import { getModelToken } from "@nestjs/mongoose";
import { Order } from "../schema/order.schema";
import { UserOrder } from "../schema/user-order.schema";
import { Product } from "../schema/product.schema";
import { User } from "../../auth/schemas/user.schema";
import { PaymentMethod } from "../../payment/dto/process-payment.dto";
import { PaymentStatus } from "../../payment/dto/payment-response.dto";
import { DeliveryMethod } from "../dto/create-order.dto";
import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";

describe("OrderService", () => {
  let service: OrderService;
  let paymentService: PaymentService;
  let mockOrderModel: any;
  let mockUserOrderModel: any;
  let mockProductModel: any;
  let mockUserModel: any;

  beforeEach(async () => {
    mockOrderModel = {
      new: jest.fn().mockReturnThis(),
      save: jest.fn(),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "orderId" }),
      }),
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockUserOrderModel = {
      new: jest.fn().mockReturnThis(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockProductModel = {
      findById: jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        name: "Sample Product",
        price: 100,
      }),
    };

    mockUserModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const mockPaymentService = {
      processPayment: jest.fn(),
      refundPayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(UserOrder.name),
          useValue: mockUserOrderModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createOrder", () => {
    it("should throw an error if cart is empty", async () => {
      const userId = new Types.ObjectId().toString();
      const orderDto = {
        deliveryDetails: {
          address: "Test Address",
          city: "Tashkent",
          contactPhone: "+998901234567",
          deliveryMethod: DeliveryMethod.STANDARD,
        },
        paymentDetails: {
          amount: 100,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          cardNumber: "4111111111111111",
          cardExpiry: "12/24",
          cardCVC: "123",
          cardholderName: "John Doe",
        },
        notes: "Test order",
      };

      mockUserModel.findById.mockResolvedValue({
        _id: userId,
        cart: [], // Cart is empty
        exec: jest.fn().mockResolvedValue({}),
      });

      await expect(service.createOrder(userId, orderDto)).rejects.toThrowError(
        BadRequestException
      );
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
    });

    it("should create an order successfully", async () => {
      const userId = new Types.ObjectId().toString();
      const product1Id = new Types.ObjectId();
      const product2Id = new Types.ObjectId();

      const orderDto = {
        deliveryDetails: {
          address: "Test Address",
          city: "Tashkent",
          contactPhone: "+998901234567",
          deliveryMethod: DeliveryMethod.STANDARD,
        },
        paymentDetails: {
          amount: 300,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          cardNumber: "4111111111111111",
          cardExpiry: "12/24",
          cardCVC: "123",
          cardholderName: "John Doe",
        },
        notes: "Test order",
      };

      mockUserModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: userId,
          cart: [], // cart is empty in the first test
        }),
      });

      mockProductModel.findById = jest.fn().mockImplementation((id) => {
        if (id.equals(product1Id)) {
          return {
            exec: jest.fn().mockResolvedValue({
              _id: product1Id,
              name: "Product 1",
              price: 100,
              newPrice: null,
            }),
          };
        } else if (id.equals(product2Id)) {
          return {
            exec: jest.fn().mockResolvedValue({
              _id: product2Id,
              name: "Product 2",
              price: 150,
              newPrice: 100,
            }),
          };
        }
        return {
          exec: jest.fn().mockResolvedValue(null),
        };
      });

      (paymentService.processPayment as jest.Mock).mockResolvedValue({
        transactionId: "pay_123456789",
        status: PaymentStatus.COMPLETED,
        amount: 300,
        timestamp: new Date().toISOString(),
        message: "Payment processed successfully",
      });

      const savedOrder = {
        _id: new Types.ObjectId(),
        userId,
        products: [
          {
            productId: product1Id,
            quantity: 1,
            price: 100,
            productName: "Product 1",
          },
          {
            productId: product2Id,
            quantity: 2,
            price: 100,
            productName: "Product 2",
          },
        ],
        totalAmount: 300,
        status: "processing",
        toObject: () => ({
          _id: "order1",
          userId,
          totalAmount: 300,
        }),
      };
      mockOrderModel.save.mockResolvedValue(savedOrder);

      // Act
      const result = await service.createOrder(userId, orderDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.message).toContain("Order created successfully");
      expect(paymentService.processPayment).toHaveBeenCalledWith(
        orderDto.paymentDetails
      );
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: { cart: [] } },
        { new: true }
      );
    });
  });
});
