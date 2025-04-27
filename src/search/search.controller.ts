import { Controller, Get, Query } from "@nestjs/common"
import  { SearchService } from "./search.service"
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Search across products and categories" })
  @ApiQuery({ name: "q", description: "Search query" })
  @ApiQuery({
    name: "limit",
    description: "Maximum number of results per type",
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Returns search results with products and categories",
  })
  search(@Query("q") query: string, @Query("limit") limit?: number) {
    return this.searchService.search(query, limit ? Number.parseInt(limit as unknown as string) : 10)
  }
}
