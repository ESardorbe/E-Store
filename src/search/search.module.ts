import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { SearchService } from "./search.service"
import { SearchController } from "./search.controller"
import { Product, ProductSchema } from "../product/schema/product.schema"
import { Category, CategorySchema } from "../category/schema/category.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
