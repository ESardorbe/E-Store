import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, Schema } from "mongoose";
import { Product, ProductDocument } from "./schema/product.schema";
import { User, UserDocument } from "../auth/schemas/user.schema";
import { Review, ReviewDocument } from "./schema/review.schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { FilterProductDto, SortOrder } from "./dto/filter-product.dto";
import type { AddToCartDto } from "./dto/add-to-cart.dto";
import type { CreateOrderDto } from "./dto/create-order.dto";
import type { AddProductImagesDto } from "./dto/add-product-images.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productModel
      .findOne({ name: createProductDto.name })
      .exec();
    if (existingProduct) {
      throw new ConflictException(
        `Product with name "${createProductDto.name}" already exists`
      );
    }

    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(
    filterDto: FilterProductDto
  ): Promise<{ products: Product[]; total: number; pages: number }> {
    const {
      category_id,
      search,
      sort,
      priceMin,
      priceMax,
      page = 1,
      limit = 10,
    } = filterDto;
    const query: any = {};

    if (category_id) {
      query.category_id = new Types.ObjectId(category_id);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
        { colour: { $regex: search, $options: "i" } },
      ];
    }

    if (priceMin || priceMax) {
      query.newPrice = {};
      if (priceMin) query.newPrice.$gte = priceMin;
      if (priceMax) query.newPrice.$lte = priceMax;
    }

    const skip = (page - 1) * limit;
    let sortBy: { [key: string]: 1 | -1 } = { createdAt: -1 };

    switch (sort) {
      case SortOrder.PRICE_ASC:
        sortBy = { newPrice: 1 };
        break;
      case SortOrder.PRICE_DESC:
        sortBy = { newPrice: -1 };
        break;
      case SortOrder.NAME_ASC:
        sortBy = { name: 1 };
        break;
      case SortOrder.NAME_DESC:
        sortBy = { name: -1 };
        break;
      case SortOrder.NEWEST:
      default:
        sortBy = { createdAt: -1 };
    }

    const total = await this.productModel.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const products = await this.productModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortBy)
      .exec();

    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const { averageRating, reviewCount } = await this.getProductRating(
          (product._id as Types.ObjectId).toString()
        );
        return {
          ...product.toObject(),
          averageRating,
          reviewCount,
        };
      })
    );

    return {
      products: productsWithRatings,
      total,
      pages,
    };
  }

  async findByCategory(
    categoryId: string,
    filterDto: FilterProductDto
  ): Promise<{ products: Product[]; total: number; pages: number }> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException("Invalid category ID format");
    }

    // Override category_id in filter with the provided categoryId
    filterDto.category_id = categoryId;

    return this.findAll(filterDto);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product as Product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product as Product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    
  }

  // PRODUCT IMAGES
  async addProductImages(
    id: string,
    addProductImagesDto: AddProductImagesDto
  ): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    product.additionalImages = [
      ...product.additionalImages,
      ...addProductImagesDto.images,
    ];
    return product.save() as Promise<Product>;
  }

  async removeProductImage(id: string, imageUrl: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    product.additionalImages = product.additionalImages.filter(
      (img) => img !== imageUrl
    );
    return product.save() as Promise<Product>;
  }

  async setMainProductImage(id: string, imageUrl: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    product.imageUrl = imageUrl;
    return product.save() as Promise<Product>;
  }

  // PRODUCT RATINGS
  async getProductRating(
    productId: string
  ): Promise<{ averageRating: number; reviewCount: number }> {
    const result = await this.reviewModel
      .aggregate([
        { $match: { productId: new Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ])
      .exec();

    if (!result.length) {
      return { averageRating: 0, reviewCount: 0 };
    }

    return {
      averageRating: result[0].averageRating || 0,
      reviewCount: result[0].reviewCount || 0,
    };
  }

  // LIKES FUNCTIONALITY
  async likeProduct(
    userId: string,
    productId: string
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const productObjectId = new Types.ObjectId(productId);
    if (
      user.likedProducts.some((id) =>
        (id as unknown as Types.ObjectId).equals(productObjectId)
      )
    ) {
      throw new BadRequestException("Product already liked");
    }

    user.likedProducts.push(
      productObjectId as unknown as Schema.Types.ObjectId
    );
    await user.save();

    return { message: "Product liked successfully" };
  }

  async unlikeProduct(
    userId: string,
    productId: string
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const productObjectId = new Types.ObjectId(productId);
    if (
      !user.likedProducts.some((id) =>
        (id as unknown as Types.ObjectId).equals(productObjectId)
      )
    ) {
      throw new BadRequestException("Product not liked");
    }

    user.likedProducts = user.likedProducts.filter(
      (id) => !(id as unknown as Types.ObjectId).equals(productObjectId)
    );
    await user.save();

    return { message: "Product unliked successfully" };
  }

  async getLikedProducts(userId: string): Promise<Product[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.productModel
      .find({ _id: { $in: user.likedProducts } })
      .exec() as Promise<Product[]>;
  }

  // CART FUNCTIONALITY
  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const product = await this.productModel
      .findById(addToCartDto.productId)
      .exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const productObjectId = new Types.ObjectId(addToCartDto.productId);
    const existingItem = user.cart.find((item) =>
      (item.productId as unknown as Types.ObjectId).equals(productObjectId)
    );

    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
    } else {
      user.cart.push({
        productId: productObjectId as unknown as Schema.Types.ObjectId,
        quantity: addToCartDto.quantity,
        addedAt: new Date(),
      });
    }

    await user.save();
    return { message: "Product added to cart successfully" };
  }

  async getCart(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate("cart.productId")
      .exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const cartItems = user.cart.map((item) => {
      const product = item.productId as unknown as ProductDocument;
      return {
        product: {
          ...product.toObject(),
          _id: (product._id as unknown as Types.ObjectId).toString(),
        },
        quantity: item.quantity,
        addedAt: item.addedAt,
      };
    });

    return cartItems;
  }

  async updateCartItem(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const productObjectId = new Types.ObjectId(productId);
    const cartItem = user.cart.find((item) =>
      (item.productId as unknown as Types.ObjectId).equals(productObjectId)
    );
    if (!cartItem) {
      throw new NotFoundException("Product not found in cart");
    }

    cartItem.quantity = quantity;
    await user.save();

    return { message: "Cart item updated successfully" };
  }

  async removeFromCart(
    userId: string,
    productId: string
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const productObjectId = new Types.ObjectId(productId);
    user.cart = user.cart.filter(
      (item) =>
        !(item.productId as unknown as Types.ObjectId).equals(productObjectId)
    );
    await user.save();

    return { message: "Product removed from cart successfully" };
  }

  async clearCart(userId: string): Promise<{ message: string }> {
    const user = await this.userModel.findByIdAndDelete(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return { message: "Cart cleared successfully" };
  }

  // ORDER FUNCTIONALITY
  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto
  ): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate("cart.productId")
      .exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.cart.length) {
      throw new BadRequestException("Cart is empty");
    }

    const orderItems = user.cart.map((item) => {
      const product = item.productId as unknown as ProductDocument;
      return {
        productId: new Types.ObjectId(
          (product._id as unknown as Types.ObjectId).toString()
        ) as unknown as Schema.Types.ObjectId,
        quantity: item.quantity,
        price: product.newPrice || product.price || 0,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = {
      products: orderItems,
      totalAmount,
      orderDate: new Date(),
      status: "pending",
    };

    user.orders.push(order as any);
    user.cart = [];
    await user.save();

    return order;
  }

  async getOrders(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user.orders;
  }

  async getOrderDetails(userId: string, orderId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const order = user.orders.find(
      (o) => (o as any)._id?.toString() === orderId
    );
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }
}
