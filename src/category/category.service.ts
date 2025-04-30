import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Category, CategoryDocument } from "./schema/category.schema";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
  ) {}

  //Category yaratish
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryModel
      .findOne({ name: createCategoryDto.name })
      .exec();
    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${createCategoryDto.name}" already exists`
      );
    }

    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  //Categorylarni olish
  async findAll(activeOnly = false): Promise<Category[]> {
    const query = activeOnly ? { isActive: true } : {};
    return this.categoryModel.find(query).sort({ order: 1, name: 1 }).exec();
  }

  //Categoryni ID bo'yicha topish
  async findById(id: string): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid category ID format");
    }

    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  //Categoryni yangilash
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid category ID format");
    }

    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel
        .findOne({
          name: updateCategoryDto.name,
          _id: { $ne: id },
        })
        .exec();

      if (existingCategory) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists`
        );
      }
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updatedCategory;
  }

  //Categoryni o'chirish
  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid category ID format");
    }

    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return { message: "Category deleted successfully" };
  }
}
