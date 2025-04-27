import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import  { Model } from "mongoose"
import { Product,  ProductDocument } from "../product/schema/product.schema"
import { Category,  CategoryDocument } from "../category/schema/category.schema"

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>
  ) {}

  async search(query: string, limit = 10) {
    if (!query || query.trim() === "") {
      return {
        products: [],
        categories: [],
      }
    }

    const searchRegex = { $regex: query, $options: "i" }

    // Search products
    const products = await this.productModel
      .find({
        $or: [{ name: searchRegex }, { details: searchRegex }, { colour: searchRegex }],
      })
      .limit(limit)
      .exec()

    // Search categories
    const categories = await this.categoryModel
      .find({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      })
      .limit(limit)
      .exec()

    return {
      products,
      categories,
    }
  }
}
