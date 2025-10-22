import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para búsqueda en MET Museum
 */
export class MetSearchRequestDto {
  @ApiProperty({
    description: 'Término de búsqueda para encontrar obras de arte en el MET',
    example: 'van gogh',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  query: string;

  @ApiPropertyOptional({
    description: 'Número máximo de resultados a devolver',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Departamento específico del museo para filtrar resultados',
    example: 'European Paintings'
  })
  @IsOptional()
  @IsString()
  department?: string;
}

/**
 * DTO para solicitud de obra específica
 */
export class MetObjectRequestDto {
  @ApiProperty({
    description: 'ID único de la obra en el MET Museum',
    example: 436532,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  objectID: number;
}