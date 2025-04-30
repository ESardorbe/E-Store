import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "../product.service";
import { getModelToken } from "@nestjs/mongoose";
import { Product } from "../schema/product.schema";
import { User } from "../../auth/schemas/user.schema";
import { Review } from "../schema/review.schema";
import { SortOrder } from "../dto/filter-product.dto";
import { Types } from "mongoose";

describe("ProductsService", () => {
  let service: ProductsService;
  let mockProductModel: any;
  let mockUserModel: any;
  let mockReviewModel: any;

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
  ];

  const userData = {
    _id: new Types.ObjectId(),
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    cart: [{ productId: new Types.ObjectId(), quantity: 2 }],
  };

  beforeEach(async () => {
    // Mock models
    mockProductModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(productData[0]),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      countDocuments: jest.fn().mockResolvedValue(10),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(productData),
      create: jest.fn(), // For create method
    };

    mockUserModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(userData),
      }),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      save: jest.fn(),
    };

    mockReviewModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ averageRating: 4.5, reviewCount: 10 }]),
      }),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    // Create TestingModule
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
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return products with pagination info", async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        sort: SortOrder.NEWEST,
      };

      // Ensure the find chain is properly mocked
      const queryMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(productData),
      };

      mockProductModel.find.mockReturnValue(queryMock);
      mockReviewModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ averageRating: 4.5, reviewCount: 10 }]),
      });

      const result = await service.findAll(filterDto);

      expect(result).toHaveProperty("products");
      expect(result).toHaveProperty("total", 10);
      expect(result).toHaveProperty("pages", 1);
      expect(mockProductModel.find).toHaveBeenCalled();
      expect(queryMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(queryMock.limit).toHaveBeenCalledWith(10);
      expect(queryMock.skip).toHaveBeenCalledWith(0);
      expect(mockReviewModel.aggregate).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return a single product by id", async () => {
      const productId = new Types.ObjectId().toString();

      const product = {
        _id: productId,
        name: "iPhone 12",
        price: 799,
        toObject: () => ({
          _id: productId,
          name: "iPhone 12",
          price: 799,
        }),
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      const result = await service.findById(productId);

      expect(result).toHaveProperty("name", "iPhone 12");
      expect(result).toHaveProperty("price", 799);
      expect(mockProductModel.findById).toHaveBeenCalledWith(productId);
    });
  });

  describe("create", () => {
    it("should create a new product", async () => {
      const newProduct = {
        name: "MacBook",
        price: 1299,
        category_id: new Types.ObjectId().toString(),
        imageUrl: "http://example.com/macbook-pro.jpg",
        colour: "Silver",
        details: "Apple MacBook Pro with M1 chip",
      };

      const createdProduct = {
        _id: new Types.ObjectId().toString(),
        ...newProduct,
      };

      mockProductModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // No existing product
      });

      mockProductModel.create.mockResolvedValue(createdProduct);

      const result = await service.create(newProduct);

      expect(result).toHaveProperty("name", "MacBook Pro");
      expect(result).toHaveProperty("price", 1299);
      expect(result).toHaveProperty("category_id");
      expect(result).toHaveProperty("imageUrl");
      expect(result).toHaveProperty("colour");
      expect(result).toHaveProperty("details");
      expect(mockProductModel.findOne).toHaveBeenCalledWith({ name: newProduct.name });
      expect(mockProductModel.create).toHaveBeenCalledWith(newProduct);
    });
  });
});