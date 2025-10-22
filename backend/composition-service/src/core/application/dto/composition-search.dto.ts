import { IsString, IsOptional, IsArray, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para búsqueda compuesta en múltiples museos
 */
export class CompositionSearchDto {
  @ApiProperty({
    description: 'Término de búsqueda para encontrar obras de arte',
    example: 'monet',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Lista de museos a incluir en la búsqueda',
    example: ['met', 'harvard'],
    type: [String],
    enum: ['met', 'harvard']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  museums?: string[];

  @ApiPropertyOptional({
    description: 'Número máximo de resultados por museo',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiPropertyOptional({
    description: 'Criterio de ordenamiento de resultados',
    example: 'relevance',
    enum: ['relevance', 'date', 'title', 'museum'],
    default: 'relevance'
  })
  @IsOptional()
  @IsString()
  @IsIn(['relevance', 'date', 'title', 'museum'])
  sortBy?: 'relevance' | 'date' | 'title' | 'museum';

  @ApiPropertyOptional({
    description: 'Período histórico para filtrar obras',
    example: 'Impressionist'
  })
  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  artist?: string;
}