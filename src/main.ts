import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ValidationPipe } from "@nestjs/common"
import { join } from "path"
import * as express from "express"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors()

  app.use("/uploads", express.static(join(__dirname, "..", "uploads")))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Swagger 
  const config = new DocumentBuilder()
    .setTitle("E-Store API Documentation")
    .setDescription("API documentation for E-Store application")
    .setVersion("1.0")
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      in: "header",
    })
    .addTag("Authentication", "User authentication endpoints")
    .addTag("Products", "Product management endpoints")
    .addTag("Categories", "Category management endpoints")
    .addTag("Reviews", "Product review endpoints")
    .addTag("Search", "Search functionality across the site")
    .addTag("File Upload", "File upload endpoints")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)

  const PORT = process.env.PORT || 3000
  await app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    console.log(`Swagger documentation available at http://localhost:${PORT}/api`)
  })
}
bootstrap()
