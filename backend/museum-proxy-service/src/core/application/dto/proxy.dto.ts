import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para búsqueda de obras a través del proxy
 */
export class SearchArtworksDto {
  @ApiProperty({
    description: 'Término de búsqueda para encontrar obras de arte',
    example: 'monet',
    minLength: 2,
    maxLength: 100
  })
  query: string;

  @ApiPropertyOptional({
    description: 'Número máximo de resultados',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  limit?: number = 20;
}

/**
 * DTO de respuesta para obra individual
 */
export class ArtworkResponseDto {
  @ApiProperty({
    description: 'ID único de la obra',
    example: '436532'
  })
  id: string;

  @ApiProperty({
    description: 'Título de la obra de arte',
    example: 'The Starry Night'
  })
  title: string;

  @ApiProperty({
    description: 'Nombre del artista',
    example: 'Vincent van Gogh'
  })
  artist: string;

  @ApiProperty({
    description: 'Museo de origen',
    example: 'met',
    enum: ['met', 'harvard']
  })
  museum: 'met' | 'harvard';

  @ApiPropertyOptional({
    description: 'URL de la imagen de la obra',
    example: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg'
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la obra',
    example: 'Oil painting by Vincent van Gogh...'
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Año de creación',
    example: 1889
  })
  year?: number;

  @ApiPropertyOptional({
    description: 'Dimensiones de la obra',
    example: '73.7 × 92.1 cm (29 × 36 1/4 in.)'
  })
  dimensions?: string;
}

/**
 * DTO de respuesta del proxy con metadatos
 */
export class ProxyResponseDto<T> {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Datos de respuesta'
  })
  data?: T;

  @ApiPropertyOptional({
    description: 'Mensaje de error si la operación falló',
    example: 'Service temporarily unavailable'
  })
  error?: string;

  @ApiProperty({
    description: 'Fuente de los datos',
    example: 'met',
    enum: ['met', 'harvard']
  })
  source: 'met' | 'harvard';

  @ApiProperty({
    description: 'Indica si los datos provienen del cache',
    example: false,
    default: false
  })
  fromCache: boolean = false;
}