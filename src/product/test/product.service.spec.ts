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
    // Soxta modellari yaratish
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
      exec: jest.fn().mockResolvedValue(productData), // exec metodini mock qilish
      save: jest.fn(),
      aggregate: jest.fn(),
    };

    mockUserModel = {
      findById: jest.fn().mockResolvedValue(userData),
      findByIdAndUpdate: jest.fn(),
      save: jest.fn(),
    };

    mockReviewModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      aggregate: jest.fn(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    // TestingModule yaratish
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

      mockProductModel.exec.mockResolvedValue(productData);
      mockReviewModel.aggregate.mockResolvedValue([]);

      const result = await service.findAll(filterDto);

      expect(result).toHaveProperty("products");
      expect(result).toHaveProperty("total", 10);
      expect(result).toHaveProperty("pages", 1);
      expect(mockProductModel.find).toHaveBeenCalled();
      expect(mockProductModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockProductModel.limit).toHaveBeenCalledWith(10);
      expect(mockProductModel.skip).toHaveBeenCalledWith(0);
    });
  });

  describe("findById", () => {
    it("should return a single product by id", async () => {
      const productId = new Types.ObjectId().toString();

      const productData = {
        _id: productId,
        name: "iPhone 12",
        price: 799,
        toObject: () => ({
          _id: "product1",
          name: "iPhone 12",
          price: 799,
        }),
      };

      mockProductModel.findById.mockResolvedValue(productData);

      const result = await service.findById(productId);

      expect(result).toHaveProperty("name", "iPhone 12");
      expect(result).toHaveProperty("price", 799);
      expect(mockProductModel.findById).toHaveBeenCalledWith(productId);
    });
  });

  describe("create", () => {
    it("should create a new product", async () => {
      const newProduct = {
        name: "MacBook Pro",
        price: 1299,
        category_id: new Types.ObjectId().toString(),
        imageUrl: "http://example.com/macbook-pro.jpg",
        colour: "Silver",
        details: "Apple MacBook Pro with M1 chip",
      };

      const createdProduct = {
        _id: new Types.ObjectId(),
        ...newProduct,
        save: jest.fn().mockResolvedValue(newProduct),
      };

      mockProductModel.save.mockResolvedValue(createdProduct);

      const result = await service.create(newProduct);

      expect(result).toHaveProperty("name", "MacBook Pro");
      expect(result).toHaveProperty("price", 1299);
      expect(result).toHaveProperty("category_id");
      expect(result).toHaveProperty("imageUrl");
      expect(result).toHaveProperty("colour");
      expect(result).toHaveProperty("details");
      expect(mockProductModel.save).toHaveBeenCalled();
    });
  });
});
