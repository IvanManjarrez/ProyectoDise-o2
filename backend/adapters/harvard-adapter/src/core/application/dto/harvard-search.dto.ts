import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Harvard Search Request DTO
 * Validación de parámetros de búsqueda para Harvard Art Museums
 */
export class HarvardSearchRequestDTO {
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  q: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  classification?: string;

  @IsOptional()
  @IsString()
  culture?: string;

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
  objectId: string;
  title: string;
  artistName: string;
  imageUrl: string;
  department: string;
  culture?: string;
  period?: string;
  century?: string;
  dated?: string;
  medium?: string;
  dimensions?: string;
  isPublicDomain?: boolean;
  objectURL?: string;
  tags?: string[];
  description?: string;
  accessionNumber?: string;
  classification?: string;
  technique?: string;
  provenance?: string;
  copyright?: string;
  museum: string = 'Harvard Art Museums';
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
  query: string;
  total: number;
  objectIDs: string[];
  artworks: HarvardArtworkResponseDTO[];
  executionTimeMs: number;
  limit?: number;
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
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string = 'harvard-adapter';
  version: string = '1.0.0';
  harvardApiConnection: boolean;
  responseTimeMs?: number;

  constructor(isHealthy: boolean, responseTimeMs?: number) {
    this.status = isHealthy ? 'healthy' : 'unhealthy';
    this.timestamp = new Date().toISOString();
    this.harvardApiConnection = isHealthy;
    this.responseTimeMs = responseTimeMs;
  }
}