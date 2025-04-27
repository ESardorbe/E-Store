import { Module } from "@nestjs/common";
import { ProductsService } from "./product.service";
import { ProductController } from "./product.controller";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "./schema/product.schema";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { Review, ReviewSchema } from "./schema/review.schema";
import { Order, OrderSchema } from "./schema/order.schema";
import { UserOrder, UserOrderSchema } from "./schema/user-order.schema";
import { Category, CategorySchema } from "../category/schema/category.schema"
import { JwtModule } from "@nestjs/jwt";
import { PaymentModule } from "../payment/payment.module";
import { PaymentService } from "src/payment/payment.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Order.name, schema: OrderSchema },
      { name: UserOrder.name, schema: UserOrderSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: "60s" },
    }),
    PaymentModule,
  ],
  controllers: [ProductController, ReviewController, OrderController],
  providers: [ProductsService, ReviewService, OrderService],
})
export class ProductModule {}
