import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { Role } from "../auth/enums/role.enum";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags("Categories")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new category (Admin only)" })
  @ApiResponse({ status: 201, description: "Category created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 409,
    description: "Category with this name already exists",
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all categories" })
  @ApiQuery({
    name: "activeOnly",
    required: false,
    type: Boolean,
    description: "Filter to show only active categories",
  })
  @ApiResponse({ status: 200, description: "Returns all categories" })
  findAll(@Query("activeOnly") activeOnly?: boolean) {
    const isActiveOnly =
      typeof activeOnly === "string" ? activeOnly === "true" : !!activeOnly;
    return this.categoryService.findAll(isActiveOnly);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a category by ID" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 200, description: "Returns the category" })
  @ApiResponse({ status: 404, description: "Category not found" })
  findOne(@Param("id") id: string) {
    return this.categoryService.findById(id);
  }

  @Put(":id")
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a category (Admin only)" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 200, description: "Category updated successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiResponse({
    status: 409,
    description: "Category with this name already exists",
  })
  update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(":id")
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a category (Admin only)" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 200, description: "Category deleted successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  remove(@Param("id") id: string) {
    return this.categoryService.remove(id);
  }
}
