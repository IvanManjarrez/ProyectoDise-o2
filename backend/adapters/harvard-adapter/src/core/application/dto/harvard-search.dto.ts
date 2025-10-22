import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Harvard Search Request DTO
 * Validación de parámetros de búsqueda para Harvard Art Museums
 */
export class HarvardSearchRequestDTO {
  @ApiProperty({
    description: 'Término de búsqueda para encontrar obras de arte',
    example: 'monet',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  q: string;

  @ApiPropertyOptional({
    description: 'Número máximo de resultados a devolver',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'División del museo para filtrar resultados',
    example: 'European and American Art'
  })
  @IsOptional()
  @IsString()
  division?: string;

  @ApiPropertyOptional({
    description: 'Clasificación artística para filtrar',
    example: 'Paintings'
  })
  @IsOptional()
  @IsString()
  classification?: string;

  @ApiPropertyOptional({
    description: 'Cultura o origen de la obra',
    example: 'French'
  })
  @IsOptional()
  @IsString()
  culture?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo obras que tienen imagen disponible',
    example: true,
    type: 'boolean'
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    return value;
  })
  hasImage?: boolean;
}

/**
 * Harvard Artwork Response DTO
 * Formato de respuesta para una obra de arte individual
 */
export class HarvardArtworkResponseDTO {
  @ApiProperty({
    description: 'ID único de la obra en la colección de Harvard',
    example: '331916'
  })
  objectId: string;

  @ApiProperty({
    description: 'Título de la obra de arte',
    example: 'Water Lilies'
  })
  title: string;

  @ApiProperty({
    description: 'Nombre del artista o creador',
    example: 'Claude Monet'
  })
  artistName: string;

  @ApiProperty({
    description: 'URL de la imagen de la obra (si está disponible)',
    example: 'https://nrs.harvard.edu/urn-3:HUAM:331916'
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Departamento o división del museo',
    example: 'European and American Art'
  })
  department: string;

  @ApiPropertyOptional({
    description: 'Cultura o origen de la obra',
    example: 'French'
  })
  culture?: string;

  @ApiPropertyOptional({
    description: 'Período histórico de la obra',
    example: 'Early 20th century'
  })
  period?: string;

  @ApiPropertyOptional({
    description: 'Siglo de creación',
    example: '20th century'
  })
  @ApiPropertyOptional({
    description: 'Siglo de creación',
    example: '20th century'
  })
  century?: string;

  @ApiPropertyOptional({
    description: 'Fecha de creación de la obra',
    example: '1919'
  })
  dated?: string;

  @ApiPropertyOptional({
    description: 'Técnica y materiales utilizados',
    example: 'Oil on canvas'
  })
  medium?: string;

  @ApiPropertyOptional({
    description: 'Dimensiones de la obra',
    example: '100.3 x 81.3 cm'
  })
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Si la obra está en dominio público',
    example: true
  })
  isPublicDomain?: boolean;

  @ApiPropertyOptional({
    description: 'URL con información detallada de la obra',
    example: 'https://harvardartmuseums.org/collections/object/331916'
  })
  objectURL?: string;

  @ApiPropertyOptional({
    description: 'Etiquetas asociadas a la obra',
    example: ['impressionism', 'landscape', 'water lilies'],
    type: [String]
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Descripción detallada de la obra',
    example: 'One of Monet\'s famous water lily paintings from his garden in Giverny'
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Número de registro de la obra',
    example: '1979.277'
  })
  accessionNumber?: string;

  @ApiPropertyOptional({
    description: 'Clasificación artística',
    example: 'Paintings'
  })
  classification?: string;

  @ApiPropertyOptional({
    description: 'Técnica específica utilizada',
    example: 'Oil painting'
  })
  technique?: string;

  @ApiPropertyOptional({
    description: 'Procedencia y historial de la obra',
    example: 'Donated by the artist\'s family in 1979'
  })
  provenance?: string;

  @ApiPropertyOptional({
    description: 'Información de derechos de autor',
    example: 'Public Domain'
  })
  copyright?: string;

  @ApiProperty({
    description: 'Nombre del museo',
    example: 'Harvard Art Museums',
    default: 'Harvard Art Museums'
  })
  museum: string = 'Harvard Art Museums';

  @ApiProperty({
    description: 'Indica si la obra tiene imagen disponible',
    example: true
  })
  hasImage: boolean;

  constructor(data: Partial<HarvardArtworkResponseDTO>) {
    Object.assign(this, data);
  }
}

/**
 * Harvard Search Response DTO
 * Formato de respuesta para búsquedas
 */
export class HarvardSearchResponseDTO {
  @ApiProperty({
    description: 'Término de búsqueda utilizado',
    example: 'monet'
  })
  query: string;

  @ApiProperty({
    description: 'Número total de obras encontradas',
    example: 86
  })
  total: number;

  @ApiProperty({
    description: 'Lista de IDs de las obras encontradas',
    example: ['331916', '227751', '228125'],
    type: [String]
  })
  objectIDs: string[];

  @ApiProperty({
    description: 'Lista de obras de arte con información detallada',
    type: [HarvardArtworkResponseDTO]
  })
  artworks: HarvardArtworkResponseDTO[];

  @ApiProperty({
    description: 'Tiempo de ejecución de la búsqueda en millisegundos',
    example: 245
  })
  executionTimeMs: number;

  @ApiPropertyOptional({
    description: 'Número de resultados solicitados',
    example: 10
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filtros aplicados en la búsqueda',
    example: { classification: 'Paintings', hasImage: true }
  })
  filters?: Record<string, any>;

  constructor(data: Partial<HarvardSearchResponseDTO>) {
    Object.assign(this, data);
    
    // Asegurar que artworks sean DTOs
    if (this.artworks) {
      this.artworks = this.artworks.map(artwork => 
        artwork instanceof HarvardArtworkResponseDTO 
          ? artwork 
          : new HarvardArtworkResponseDTO(artwork)
      );
    }
  }
}

/**
 * Harvard Division DTO
 */
export class HarvardDivisionDTO {
  divisionId: string;
  name: string;

  constructor(divisionId: string, name: string) {
    this.divisionId = divisionId;
    this.name = name;
  }
}

/**
 * Harvard Classification DTO
 */
export class HarvardClassificationDTO {
  classificationId: string;
  name: string;

  constructor(classificationId: string, name: string) {
    this.classificationId = classificationId;
    this.name = name;
  }
}

/**
 * Harvard Culture DTO
 */
export class HarvardCultureDTO {
  cultureId: string;
  name: string;

  constructor(cultureId: string, name: string) {
    this.cultureId = cultureId;
    this.name = name;
  }
}

/**
 * Harvard Health Response DTO
 */
export class HarvardHealthResponseDTO {
  @ApiProperty({
    description: 'Estado de salud del servicio',
    example: 'healthy',
    enum: ['healthy', 'unhealthy']
  })
  status: 'healthy' | 'unhealthy';

  @ApiProperty({
    description: 'Timestamp del health check en formato ISO',
    example: '2025-10-22T07:30:45.123Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Nombre del servicio',
    example: 'harvard-adapter',
    default: 'harvard-adapter'
  })
  service: string = 'harvard-adapter';

  @ApiProperty({
    description: 'Versión del servicio',
    example: '1.0.0',
    default: '1.0.0'
  })
  version: string = '1.0.0';

  @ApiProperty({
    description: 'Estado de la conexión con Harvard Art Museums API',
    example: true
  })
  harvardApiConnection: boolean;

  @ApiPropertyOptional({
    description: 'Tiempo de respuesta del health check en millisegundos',
    example: 245
  })
  responseTimeMs?: number;

  constructor(isHealthy: boolean, responseTimeMs?: number) {
    this.status = isHealthy ? 'healthy' : 'unhealthy';
    this.timestamp = new Date().toISOString();
    this.harvardApiConnection = isHealthy;
    this.responseTimeMs = responseTimeMs;
  }
}