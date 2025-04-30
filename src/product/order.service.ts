import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Order, OrderDocument } from "./schema/order.schema";
import { UserOrder, UserOrderDocument } from "./schema/user-order.schema";
import { Product, ProductDocument } from "./schema/product.schema";
import { User, UserDocument } from "../auth/schemas/user.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PaymentService } from "../payment/payment.service";
import { PaymentStatus } from "../payment/dto/payment-response.dto";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(UserOrder.name)
    private userOrderModel: Model<UserOrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private paymentService: PaymentService
  ) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto
  ): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user ID format");
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.cart.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    const cartWithProducts = await Promise.all(
      user.cart.map(async (item) => {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`
          );
        }
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.newPrice || product.price,
          productName: product.name,
        };
      })
    );

    const totalAmount = cartWithProducts.reduce(
      (total, item) => total + (item.price ?? 0) * item.quantity,
      0
    );

    const { deliveryDetails, paymentDetails, notes, saveDeliveryInfo } =
      createOrderDto;

    if (paymentDetails.amount !== totalAmount) {
      throw new ConflictException("Payment amount does not match cart total");
    }

    const paymentResult =
      await this.paymentService.processPayment(paymentDetails);

    if (paymentResult.status === PaymentStatus.FAILED) {
      throw new BadRequestException(`Payment failed: ${paymentResult.message}`);
    }

    const newOrder = new this.orderModel({
      userId: new Types.ObjectId(userId),
      products: cartWithProducts,
      totalAmount,
      deliveryDetails,
      paymentDetails: {
        paymentMethod: paymentDetails.paymentMethod,
        status: paymentResult.status,
        transactionId: paymentResult.transactionId,
        amount: paymentResult.amount,
        processedAt: new Date(),
      },
      notes,
      status: "processing",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedOrder = await newOrder.save();

    const userOrder = new this.userOrderModel({
      userId: new Types.ObjectId(userId),
      orderId: savedOrder._id,
      isArchived: false,
    });

    await userOrder.save();

    await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { cart: [] } },
      { new: true }
    );

    if (saveDeliveryInfo) {
    }

    return {
      message: "Order created successfully",
      order: {
        ...savedOrder.toObject(),
        paymentResult,
      },
    };
  }

  async getUserOrders(userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user ID format");
    }

    const userOrders = await this.userOrderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    const orders = await Promise.all(
      userOrders.map(async (userOrder) => {
        const order = await this.orderModel
          .findById(userOrder.orderId)
          .populate("products.productId", "name imageUrl")
          .exec();

        return order;
      })
    );

    return orders.filter((order) => order !== null);
  }

  async getOrderById(userId: string, orderId: string): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException("Invalid ID format");
    }

    const userOrder = await this.userOrderModel.findOne({
      userId: new Types.ObjectId(userId),
      orderId: new Types.ObjectId(orderId),
    });

    if (!userOrder) {
      throw new NotFoundException(
        `Order with ID ${orderId} not found for this user`
      );
    }

    const order = await this.orderModel
      .findById(orderId)
      .populate("products.productId", "name imageUrl additionalImages")
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string): Promise<any> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException("Invalid ID format");
    }

    const userOrder = await this.userOrderModel.findOne({
      userId: new Types.ObjectId(userId),
      orderId: new Types.ObjectId(orderId),
    });

    if (!userOrder) {
      throw new NotFoundException(
        `Order with ID ${orderId} not found for this user`
      );
    }

    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (!["pending", "processing"].includes(order.status)) {
      throw new BadRequestException(
        `Order with status ${order.status} cannot be cancelled`
      );
    }

    if (order.paymentDetails.status === PaymentStatus.COMPLETED) {
      const refundResult = await this.paymentService.refundPayment(
        order.paymentDetails.transactionId!,
        order.totalAmount
      );
      order.paymentDetails.status = PaymentStatus.REFUNDED;
    }

    order.status = "cancelled";
    order.updatedAt = new Date();
    await order.save();

    return {
      message: "Order cancelled successfully",
      order,
    };
  }
}
