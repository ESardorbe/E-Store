import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import  { FileUploadService } from "./file-upload.service"
import { AccessTokenGuard } from "../../auth/guards/access-token.guard"
import { AdminGuard } from "../../auth/guards/admin.guard"
import { Roles } from "../../auth/decorator/roles.decorator"
import { Role } from "../../auth/enums/role.enum"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger"
import { Express } from "express"

@ApiTags("File Upload")
@Controller("upload")
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post("profile-image")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload user profile image" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Image uploaded successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseInterceptors(FileInterceptor("file"))
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required")
    }

    const imageUrl = await this.fileUploadService.uploadFile(file, "profiles")
    return { imageUrl }
  }

  @Post("product-image")
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload product image (Admin only)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Image uploaded successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseInterceptors(FileInterceptor("file"))
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required")
    }
    
    const imageUrl = await this.fileUploadService.uploadFile(file, "products")
    return { imageUrl }
  }
}
