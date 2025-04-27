import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { GetCurrentUserId } from "../auth/decorator/get-current-user-id.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags("Orders")
@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new order with payment processing" })
  @ApiResponse({ status: 201, description: "Order created successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid order details or payment failed",
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetCurrentUserId() userId: string
  ) {
    return this.orderService.createOrder(userId, createOrderDto);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all orders for the current user" })
  @ApiResponse({ status: 200, description: "Returns user's order history" })
  async getUserOrders(@GetCurrentUserId() userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @Get(":id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get order details" })
  @ApiParam({ name: "id", description: "Order ID" })
  @ApiResponse({
    status: 200,
    description: "Returns detailed order information",
  })
  @ApiResponse({ status: 404, description: "Order not found" })
  async getOrderById(
    @Param("id") orderId: string,
    @GetCurrentUserId() userId: string
  ) {
    return this.orderService.getOrderById(userId, orderId);
  }

  @Delete(":id/cancel")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel an order" })
  @ApiParam({ name: "id", description: "Order ID" })
  @ApiResponse({ status: 200, description: "Order cancelled successfully" })
  @ApiResponse({ status: 400, description: "Order cannot be cancelled" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async cancelOrder(
    @Param("id") orderId: string,
    @GetCurrentUserId() userId: string
  ) {
    return this.orderService.cancelOrder(userId, orderId);
  }
}
