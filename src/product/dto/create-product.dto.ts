import { IsString, IsNumber, IsOptional, IsMongoId } from "class-validator"

export class CreateProductDto {
  @IsString()
  name: string

  @IsMongoId()
  category_id: string

  @IsString()
  imageUrl: string

  @IsOptional()
  @IsNumber()
  price?: number

  @IsOptional()
  @IsNumber()
  newPrice?: number

  @IsOptional()
  @IsNumber()
  oldPrice?: number

  @IsString()
  colour: string

  @IsOptional()
  @IsString()
  memory?: string

  @IsOptional()
  @IsString()
  screenSize?: string

  @IsOptional()
  @IsString()
  cpu?: string

  @IsOptional()
  @IsNumber()
  numberOfCores?: number

  @IsOptional()
  @IsString()
  mainCamera?: string

  @IsOptional()
  @IsString()
  frontCamera?: string

  @IsOptional()
  @IsNumber()
  batteryCapacity?: number

  @IsString()
  details: string
}
