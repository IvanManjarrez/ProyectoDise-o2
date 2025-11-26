import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FavoriteDto {
  @ApiProperty({
    description: 'ID único de la obra de arte',
    example: 'met_438003'
  })
  @IsNotEmpty()
  @IsString()
  artworkId: string

  @ApiProperty({
    description: 'Título de la obra',
    example: 'The Starry Night',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({
    description: 'Artista de la obra',
    example: 'Vincent van Gogh',
    required: false
  })
  @IsOptional()
  @IsString()
  artist?: string

  @ApiProperty({
    description: 'URL de la imagen de la obra',
    example: 'https://example.com/image.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiProperty({
    description: 'Museo de origen',
    example: 'met',
    required: false
  })
  @IsOptional()
  @IsString()
  museum?: string

  @ApiProperty({
    description: 'Descripción de la obra',
    example: 'Oil on canvas',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: 'Año de creación',
    example: 1889,
    required: false
  })
  @IsOptional()
  @IsNumber()
  year?: number
}
