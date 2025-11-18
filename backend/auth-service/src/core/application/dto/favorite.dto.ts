import { IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FavoriteDto {
  @ApiProperty({
    description: 'ID único de la obra de arte',
    example: 'artwork-12345'
  })
  @IsNotEmpty()
  artworkId: string
}
