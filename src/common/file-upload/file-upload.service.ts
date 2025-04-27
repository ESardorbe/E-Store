import { Injectable, BadRequestException } from "@nestjs/common"
import  { ConfigService } from "@nestjs/config"
import * as path from "path"
import * as fs from "fs"
import * as crypto from "crypto"

@Injectable()
export class FileUploadService {
  private readonly uploadDir: string

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), "uploads")

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }


  // Upload file to server
  async uploadFile(file: Express.Multer.File, folder = ""): Promise<string> {
    if (!file) {
      throw new BadRequestException("File is required")
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException("Only image files are allowed")
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException("File size exceeds the limit (5MB)")
    }

    const fileExtension = path.extname(file.originalname)
    const randomName = crypto.randomBytes(16).toString("hex")
    const fileName = `${randomName}${fileExtension}`

    const uploadPath = folder ? path.join(this.uploadDir, folder) : this.uploadDir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }


    const filePath = path.join(uploadPath, fileName)
    fs.writeFileSync(filePath, file.buffer)


    const baseUrl = this.configService.get<string>("BASE_URL") || "http://localhost:3000"
    const relativePath = folder ? `${folder}/${fileName}` : fileName
    return `${baseUrl}/uploads/${relativePath}`
  }


  // Delete file from server
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const baseUrl = this.configService.get<string>("BASE_URL") || "http://localhost:3000"
      const uploadPrefix = `${baseUrl}/uploads/`

      if (!fileUrl.startsWith(uploadPrefix)) {
        return false
      }

      const relativePath = fileUrl.replace(uploadPrefix, "")
      const filePath = path.join(this.uploadDir, relativePath)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }
}
