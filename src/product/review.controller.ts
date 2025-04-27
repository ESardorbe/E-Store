import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { GetCurrentUserId } from "../auth/decorator/get-current-user-id.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post("product/:productId")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new review for a product" })
  @ApiParam({ name: "productId", description: "Product ID to review" })
  @ApiResponse({ status: 201, description: "Review created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 409,
    description: "User has already reviewed this product",
  })
  @Post("product/:productId")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  create(
    @Param("productId") productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @GetCurrentUserId() userId: string
  ) {
    return this.reviewService.create(userId, productId, createReviewDto);
  }

  @Get("product/:productId")
  @ApiOperation({ summary: "Get all reviews for a product" })
  @ApiParam({ name: "productId", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Returns all reviews for the product",
  })
  findAll(@Param("productId") productId: string) {
    return this.reviewService.findAll(productId);
  }

  @Get("user/my")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all reviews by the current user" })
  @ApiResponse({ status: 200, description: "Returns all reviews by the user" })
  getUserReviews(@GetCurrentUserId() userId: string) {
    return this.reviewService.getUserReviews(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a review by ID" })
  @ApiParam({ name: "id", description: "Review ID" })
  @ApiResponse({ status: 200, description: "Returns the review" })
  @ApiResponse({ status: 404, description: "Review not found" })
  findOne(@Param("id") id: string) {
    return this.reviewService.findOne(id);
  }

  @Put(":id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a review" })
  @ApiParam({ name: "id", description: "Review ID" })
  @ApiResponse({ status: 200, description: "Review updated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - not the review owner" })
  @ApiResponse({ status: 404, description: "Review not found" })
  update(
    @Param("id") id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @GetCurrentUserId() userId: string
  ) {
    return this.reviewService.update(id, userId, updateReviewDto);
  }

  @Delete(":id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a review" })
  @ApiParam({ name: "id", description: "Review ID" })
  @ApiResponse({ status: 200, description: "Review deleted successfully" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - not the review owner or admin",
  })
  @ApiResponse({ status: 404, description: "Review not found" })
  @HttpCode(HttpStatus.OK)
  remove(@Param("id") id: string, @GetCurrentUserId() userId: string) {
    // For simplicity, we're assuming non-admin role here
    // In a real app, you'd extract the user's role from the JWT
    return this.reviewService.remove(id, userId, false);
  }

  @Delete("admin/:id")
  @UseGuards(AccessTokenGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a review (Admin)" })
  @ApiParam({ name: "id", description: "Review ID" })
  @ApiResponse({ status: 200, description: "Review deleted successfully" })
  @ApiResponse({ status: 404, description: "Review not found" })
  @HttpCode(HttpStatus.OK)
  adminRemove(@Param("id") id: string, @GetCurrentUserId() userId: string) {
    return this.reviewService.remove(id, userId, true);
  }

  @Get("rating/:productId")
  @ApiOperation({
    summary: "Get average rating and review count for a product",
  })
  @ApiParam({ name: "productId", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Returns average rating and review count",
  })
  getProductRating(@Param("productId") productId: string) {
    return this.reviewService.getProductRating(productId);
  }
}
