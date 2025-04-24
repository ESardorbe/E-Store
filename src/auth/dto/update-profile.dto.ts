import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'Sardor',
    description: 'Yangi ism (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ism matn ko‘rinishida bo‘lishi kerak' })
  @MaxLength(50, { message: 'Ism 50 ta belgidan oshmasligi kerak' })
  firstName?: string;

  @ApiProperty({
    example: 'Bek',
    description: 'Yangi familiya (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Familiya matn ko‘rinishida bo‘lishi kerak' })
  @MaxLength(50, { message: 'Familiya 50 ta belgidan oshmasligi kerak' })
  lastName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar rasmi uchun URL manzil (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL manzili noto‘g‘ri formatda' })
  avatarUrl?: string;
}
