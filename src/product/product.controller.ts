import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ProductsService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AddProductImagesDto } from "./dto/add-product-images.dto";
import { FilterProductDto } from "./dto/filter-product.dto";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Product } from "./schema/product.schema";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { GetCurrentUserId } from "../auth/decorator/get-current-user-id.decorator";
import { Roles } from "../auth/decorator/roles.decorator";
import { Role } from "../auth/enums/role.enum";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";

@ApiTags("Products")
@Controller("products")
export class ProductController {
  constructor(private readonly productsService: ProductsService) {}

  // PRODUCT MANAGEMENT (ADMIN ONLY)
  @Post()
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new product (Admin only)" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 409,
    description: "Product with this name already exists",
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Put(":id")
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a product (Admin only)" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a product (Admin only)" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  // PRODUCT IMAGES (ADMIN ONLY)
  @Post(":id/images")
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add images to a product (Admin only)" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiBody({ type: AddProductImagesDto })
  @ApiResponse({ status: 200, description: "Images added successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async addProductImages(
    @Param("id") id: string,
    @Body() addProductImagesDto: AddProductImagesDto
  ): Promise<Product> {
    return this.productsService.addProductImages(id, addProductImagesDto);
  }

  @Delete(":id/images")
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove an image from a product (Admin only)" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiBody({
    schema: { type: "object", properties: { imageUrl: { type: "string" } } },
  })
  @ApiResponse({ status: 200, description: "Image removed successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async removeProductImage(
    @Param("id") id: string,
    @Body("imageUrl") imageUrl: string
  ): Promise<Product> {
    return this.productsService.removeProductImage(id, imageUrl);
  }

  @Put(":id/main-image")
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Set main product image (Admin only)" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiBody({
    schema: { type: "object", properties: { imageUrl: { type: "string" } } },
  })
  @ApiResponse({ status: 200, description: "Main image set successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async setMainProductImage(
    @Param("id") id: string,
    @Body("imageUrl") imageUrl: string
  ): Promise<Product> {
    return this.productsService.setMainProductImage(id, imageUrl);
  }

  // PUBLIC PRODUCT ENDPOINTS
  @Get()
  @ApiOperation({ summary: "Get all products with filtering options" })
  @ApiResponse({
    status: 200,
    description: "Returns filtered products with pagination",
  })
  async findAll(
    @Query() filterDto: FilterProductDto
  ): Promise<{ products: Product[]; total: number; pages: number }> {
    return this.productsService.findAll(filterDto);
  }

  @Get("category/:categoryId")
  @ApiOperation({ summary: "Get products by category" })
  @ApiParam({ name: "categoryId", description: "Category ID" })
  @ApiResponse({
    status: 200,
    description: "Returns products in the specified category",
  })
  @ApiResponse({ status: 400, description: "Invalid category ID" })
  async findByCategory(
    @Param("categoryId") categoryId: string,
    @Query() filterDto: FilterProductDto
  ): Promise<{ products: Product[]; total: number; pages: number }> {
    return this.productsService.findByCategory(categoryId, filterDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a product by ID" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Returns the product with ratings and reviews",
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  async findOne(@Param("id") id: string): Promise<Product> {
    return this.productsService.findById(id);
  }

  // LIKES FUNCTIONALITY
  @Post("like/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Like a product" })
  @ApiParam({ name: "id", description: "Product ID to like" })
  @ApiResponse({ status: 200, description: "Product liked successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @HttpCode(HttpStatus.OK)
  async likeProduct(
    @Param("id") productId: string,
    @GetCurrentUserId() userId: string
  ): Promise<{ message: string }> {
    return this.productsService.likeProduct(userId, productId);
  }

  @Delete("like/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Unlike a product" })
  @ApiParam({ name: "id", description: "Product ID to unlike" })
  @ApiResponse({ status: 200, description: "Product unliked successfully" })
  @HttpCode(HttpStatus.OK)
  async unlikeProduct(
    @Param("id") productId: string,
    @GetCurrentUserId() userId: string
  ): Promise<{ message: string }> {
    return this.productsService.unlikeProduct(userId, productId);
  }

  @Get("likes/my")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's liked products" })
  @ApiResponse({ status: 200, description: "Returns user's liked products" })
  async getLikedProducts(
    @GetCurrentUserId() userId: string
  ): Promise<Product[]> {
    return this.productsService.getLikedProducts(userId);
  }

  // CART FUNCTIONALITY
  @Post("cart")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add product to cart" })
  @ApiResponse({
    status: 200,
    description: "Product added to cart successfully",
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  @HttpCode(HttpStatus.OK)
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @GetCurrentUserId() userId: string
  ): Promise<{ message: string }> {
    return this.productsService.addToCart(userId, addToCartDto);
  }

  @Get("cart/my")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's cart" })
  @ApiResponse({
    status: 200,
    description: "Returns user's cart with product details",
  })
  async getCart(@GetCurrentUserId() userId: string): Promise<any> {
    return this.productsService.getCart(userId);
  }

  @Put("cart/:productId")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update cart item quantity" })
  @ApiParam({ name: "productId", description: "Product ID in cart to update" })
  @ApiResponse({ status: 200, description: "Cart item updated successfully" })
  @ApiResponse({ status: 404, description: "Product not found in cart" })
  async updateCartItem(
    @Param("productId") productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @GetCurrentUserId() userId: string
  ): Promise<{ message: string }> {
    return this.productsService.updateCartItem(
      userId,
      productId,
      updateCartItemDto.quantity
    );
  }

  @Delete("cart/:productId")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove item from cart" })
  @ApiParam({
    name: "productId",
    description: "Product ID to remove from cart",
  })
  @ApiResponse({
    status: 200,
    description: "Item removed from cart successfully",
  })
  async removeFromCart(
    @Param("productId") productId: string,
    @GetCurrentUserId() userId: string
  ): Promise<{ message: string }> {
    return this.productsService.removeFromCart(userId, productId);
  }

  @Delete("cart")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Clear cart" })
  @ApiResponse({ status: 200, description: "Cart cleared successfully" })
  async clearCart(
    @GetCurrentUserId() userId: string
  ): Promise<{ message: string }> {
    return this.productsService.clearCart(userId);
  }

  // ORDER FUNCTIONALITY
  @Post("orders")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create order from cart" })
  @ApiResponse({ status: 201, description: "Order created successfully" })
  @ApiResponse({ status: 400, description: "Cart is empty" })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetCurrentUserId() userId: string
  ): Promise<any> {
    return this.productsService.createOrder(userId, createOrderDto);
  }

  @Get("orders/my")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's orders" })
  @ApiResponse({ status: 200, description: "Returns user's order history" })
  async getOrders(@GetCurrentUserId() userId: string): Promise<any> {
    return this.productsService.getOrders(userId);
  }

  @Get("orders/:orderId")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get order details" })
  @ApiParam({ name: "orderId", description: "Order ID" })
  @ApiResponse({
    status: 200,
    description: "Returns detailed order information",
  })
  @ApiResponse({ status: 404, description: "Order not found" })
  async getOrderDetails(
    @Param("orderId") orderId: string,
    @GetCurrentUserId() userId: string
  ): Promise<any> {
    return this.productsService.getOrderDetails(userId, orderId);
  }
}
