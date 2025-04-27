import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Review, ReviewDocument } from "./schema/review.schema";
import { Product, ProductDocument } from "./schema/product.schema";
import { User, UserDocument } from "../auth/schemas/user.schema";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(
    userId: string,
    productId: string,
    createReviewDto: CreateReviewDto
  ): Promise<Review> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
      throw new BadRequestException("Invalid ID format");
    }

    // Check if product exists
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user has already reviewed this product
    const existingReview = await this.reviewModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (existingReview) {
      throw new ConflictException("You have already reviewed this product");
    }

    // Create new review
    const newReview = new this.reviewModel({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
      ...createReviewDto,
    });

    const savedReview = await newReview.save();

    // Update product average rating
    await this.updateProductRating(productId);

    return savedReview;
  }

  async findAll(productId: string): Promise<Review[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException("Invalid product ID format");
    }

    return this.reviewModel
      .find({ productId: new Types.ObjectId(productId), isActive: true })
      .populate("userId", "firstName lastName avatarUrl")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Review> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid review ID format");
    }

    const review = await this.reviewModel
      .findById(id)
      .populate("userId", "firstName lastName avatarUrl")
      .exec();

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(
    id: string,
    userId: string,
    updateReviewDto: UpdateReviewDto
  ): Promise<Review> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid review ID format");
    }

    // Find the review
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Check if the user is the owner of the review
    if (review.userId.toString() !== userId) {
      throw new ForbiddenException("You can only update your own reviews");
    }

    // Update the review
    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, updateReviewDto, { new: true })
      .populate("userId", "firstName lastName avatarUrl")
      .exec();

    // Update product average rating
    await this.updateProductRating(review.productId.toString());

    if (!updatedReview) {
      throw new NotFoundException(
        `Review with ID ${id} not found after update`
      );
    }

    return updatedReview;
  }

  async remove(
    id: string,
    userId: string,
    isAdmin: boolean
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid review ID format");
    }

    // Find the review
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Check if the user is the owner of the review or an admin
    if (review.userId.toString() !== userId && !isAdmin) {
      throw new ForbiddenException("You can only delete your own reviews");
    }

    // Delete the review
    await this.reviewModel.findByIdAndDelete(id);

    // Update product average rating
    await this.updateProductRating(review.productId.toString());

    return { message: "Review deleted successfully" };
  }

  async getProductRating(
    productId: string
  ): Promise<{ averageRating: number; reviewCount: number }> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException("Invalid product ID format");
    }

    const result = await this.reviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(productId), isActive: true } },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    return {
      averageRating: Number.parseFloat(result[0].averageRating.toFixed(1)),
      reviewCount: result[0].reviewCount,
    };
  }

  private async updateProductRating(productId: string): Promise<void> {
    const { averageRating, reviewCount } =
      await this.getProductRating(productId);

    // We don't actually update the product document with these values
    // since they're calculated on-the-fly, but we could if needed
    // This is just a placeholder for future implementation
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user ID format");
    }

    return this.reviewModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate("productId", "name imageUrl")
      .sort({ createdAt: -1 })
      .exec();
  }
}
