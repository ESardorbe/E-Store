import { Test, type TestingModule } from "@nestjs/testing"
import { ProductsService } from "../product.service"
import { getModelToken } from "@nestjs/mongoose"
import { Product } from "../schema/product.schema"
import { User } from "../../auth/schemas/user.schema"
import { Review } from "../schema/review.schema"
import { SortOrder } from "../dto/filter-product.dto"
import { Types } from "mongoose"

describe("ProductsService", () => {
  let service: ProductsService
  let mockProductModel: any
  let mockUserModel: any
  let mockReviewModel: any

  beforeEach(async () => {
    // Create mock implementations for our models
    mockProductModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn(),
      findOne: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn().mockResolvedValue(10),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      save: jest.fn(),
      aggregate: jest.fn(),
    }

    mockUserModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      save: jest.fn(),
    }

    mockReviewModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      aggregate: jest.fn(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Review.name),
          useValue: mockReviewModel,
        },
      ],
    }).compile()

    service = module.get<ProductsService>(ProductsService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("findAll", () => {
    it("should return products with pagination info", async () => {
      // Arrange
      const filterDto = {
        page: 1,
        limit: 10,
        sort: SortOrder.NEWEST,
      }

      const productData = [
        {
          _id: new Types.ObjectId(),
          name: "iPhone 12",
          price: 799,
          toObject: () => ({
            _id: "product1",
            name: "iPhone 12",
            price: 799,
          }),
        },
        {
          _id: new Types.ObjectId(),
          name: "Samsung Galaxy S21",
          price: 699,
          toObject: () => ({
            _id: "product2",
            name: "Samsung Galaxy S21",
            price: 699,
          }),
        },
      ]

      mockProductModel.exec.mockResolvedValue(productData)
      mockReviewModel.aggregate.mockResolvedValue([])

      // Act
      const result = await service.findAll(filterDto)

      // Assert
      expect(result).toHaveProperty("products")
      expect(result).toHaveProperty("total", 10)
      expect(result).toHaveProperty("pages", 1)
      expect(mockProductModel.find).toHaveBeenCalled()
      expect(mockProductModel.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(mockProductModel.limit).toHaveBeenCalledWith(10)
      expect(mockProductModel.skip).toHaveBeenCalledWith(0)
    })
  })
})
