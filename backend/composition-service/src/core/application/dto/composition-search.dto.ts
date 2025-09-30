import { IsString, IsOptional, IsArray, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CompositionSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  museums?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsOptional()
  @IsString()
  @IsIn(['relevance', 'date', 'title', 'museum'])
  sortBy?: 'relevance' | 'date' | 'title' | 'museum';

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  artist?: string;
}