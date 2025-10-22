import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para obra individual del MET
 */
export class MetArtworkResponseDto {
  @ApiProperty({
    description: 'ID único de la obra en el MET',
    example: 436532
  })
  objectID: number;

  @ApiProperty({
    description: 'Título de la obra de arte',
    example: 'The Starry Night'
  })
  title: string;

  @ApiProperty({
    description: 'Nombre del artista',
    example: 'Vincent van Gogh'
  })
  artistDisplayName: string;

  @ApiProperty({
    description: 'URL de la imagen principal de la obra',
    example: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg'
  })
  primaryImage: string;

  @ApiProperty({
    description: 'Departamento del museo al que pertenece',
    example: 'European Paintings'
  })
  department: string;

  @ApiPropertyOptional({
    description: 'Cultura o civilización de origen',
    example: 'Dutch'
  })
  culture?: string;

  @ApiPropertyOptional({
    description: 'Período histórico',
    example: 'Post-Impressionist'
  })
  period?: string;

  @ApiPropertyOptional({
    description: 'Dinastía (para arte asiático principalmente)',
    example: 'Ming dynasty'
  })
  dynasty?: string;

  @ApiPropertyOptional({
    description: 'Fecha de creación de la obra',
    example: '1889'
  })
  objectDate?: string;

  @ApiPropertyOptional({
    description: 'Material y técnica utilizada',
    example: 'Oil on canvas'
  })
  medium?: string;

  @ApiPropertyOptional({
    description: 'Dimensiones de la obra',
    example: '73.7 × 92.1 cm (29 × 36 1/4 in.)'
  })
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Indica si la obra está en dominio público',
    example: true
  })
  isPublicDomain?: boolean;

  @ApiPropertyOptional({
    description: 'URL de la página de la obra en el sitio del MET',
    example: 'https://www.metmuseum.org/art/collection/search/436532'
  })
  objectURL?: string;

  @ApiPropertyOptional({
    description: 'Etiquetas descriptivas asociadas',
    example: ['Landscapes', 'Night scenes', 'Stars'],
    type: [String]
  })
  tags?: string[];
}

/**
 * DTO de respuesta para búsqueda en MET
 */
export class MetSearchResponseDto {
  @ApiProperty({
    description: 'Número total de obras encontradas',
    example: 156
  })
  total: number;

  @ApiProperty({
    description: 'Lista de IDs de todas las obras encontradas',
    example: [436532, 459123, 471235],
    type: [Number]
  })
  objectIDs: number[];

  @ApiProperty({
    description: 'Lista de obras con información detallada',
    type: [MetArtworkResponseDto]
  })
  artworks: MetArtworkResponseDto[];

  @ApiProperty({
    description: 'Término de búsqueda utilizado',
    example: 'van gogh'
  })
  query: string;

  @ApiProperty({
    description: 'Límite de resultados aplicado',
    example: 20
  })
  limit: number;

  @ApiProperty({
    description: 'Tiempo de ejecución de la búsqueda en milisegundos',
    example: 234
  })
  executionTimeMs: number;
}