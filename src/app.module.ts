import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { AuthModule } from "./auth/auth.module"
import { ProductModule } from "./product/product.module"
import { CategoryModule } from "./category/category.module"
import { SearchModule } from "./search/search.module"
import { FileUploadModule } from "./common/file-upload/file-upload.module"
import { PaymentModule } from "./payment/payment.module"
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from "path"

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: "/uploads",
    }),
    AuthModule,
    ProductModule,
    CategoryModule,
    SearchModule,
    FileUploadModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
