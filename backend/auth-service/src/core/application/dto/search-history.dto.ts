import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsNumber } from 'class-validator'

export class SearchHistoryDto {
  @ApiProperty({ example: 'monet', description: 'Search query' })
  @IsString()
  query: string

  @ApiProperty({ example: 'harvard,met', required: false, description: 'Comma separated museums filter or array' })
  @IsOptional()
  museums?: any

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number

  @ApiProperty({ example: 1690000000000, required: false, description: 'Timestamp in ms' })
  @IsOptional()
  @IsNumber()
  ts?: number
}
