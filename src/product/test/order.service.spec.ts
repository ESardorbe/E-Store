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

// Interface to define savedOrder type with save method
interface MockOrder {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  products: { productId: Types.ObjectId; quantity: number; price: number; productName: string }[];
  totalAmount: number;
  status: string;
  deliveryDetails: any;
  paymentDetails: any;
  notes: string;
  createdAt: any;
  updatedAt: any;
  toObject: jest.Mock;
  save?: jest.Mock;
}

describe("OrderService", () => {
  let service: OrderService;
  let paymentService: PaymentService;
  let mockOrderModel: any;
  let mockUserOrderModel: any;
  let mockProductModel: any;
  let mockUserModel: any;

  beforeEach(async () => {
    jest.clearAllMocks(); // Reset mocks for test isolation

    mockOrderModel = {
      create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "orderId" }),
      }),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
      prototype: { save: jest.fn() }, // Support new this.orderModel().save()
    };

    mockUserOrderModel = {
      create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
      prototype: { save: jest.fn() }, // Support new this.userOrderModel().save()
    };

    mockProductModel = {
      findById: jest.fn(), // Set in tests
    };

    mockUserModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "userId", cart: [] }),
      }),
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

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: userId,
          cart: [],
        }),
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
          amount: 300, // Matches cart total: (100 * 1) + (100 * 2) = 300
          paymentMethod: PaymentMethod.CREDIT_CARD,
          cardNumber: "4111111111111111",
          cardExpiry: "12/24",
          cardCVC: "123",
          cardholderName: "John Doe",
        },
        notes: "Test order",
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: userId,
          cart: [
            { productId: product1Id, quantity: 1 },
            { productId: product2Id, quantity: 2 },
          ],
        }),
      });

      mockProductModel.findById.mockImplementation((id) => {
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

      const savedOrder: MockOrder = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
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
        deliveryDetails: orderDto.deliveryDetails,
        paymentDetails: {
          paymentMethod: orderDto.paymentDetails.paymentMethod,
          status: PaymentStatus.COMPLETED,
          transactionId: "pay_123456789",
          amount: 300,
          processedAt: expect.any(Date),
        },
        notes: orderDto.notes,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        toObject: jest.fn().mockReturnValue({
          _id: "order1",
          userId,
          totalAmount: 300,
          status: "processing",
        }),
      };

      // Attach save method after declaration
      savedOrder.save = jest.fn().mockResolvedValue(savedOrder);

      mockOrderModel.create.mockResolvedValue(savedOrder);
      mockUserOrderModel.create.mockResolvedValue({
        userId: new Types.ObjectId(userId),
        orderId: savedOrder._id,
      });

      const result = await service.createOrder(userId, orderDto);

      expect(result).toBeDefined();
      expect(result.message).toBe("Order created successfully");
      expect(result.order).toBeDefined();
      expect(paymentService.processPayment).toHaveBeenCalledWith(
        orderDto.paymentDetails
      );
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: { cart: [] } },
        { new: true }
      );
      expect(mockOrderModel.create).toHaveBeenCalled();
      expect(mockUserOrderModel.create).toHaveBeenCalled();
    });
  });
});