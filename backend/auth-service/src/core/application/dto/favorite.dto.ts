import { IsNotEmpty } from 'class-validator'

export class FavoriteDto {
  @IsNotEmpty()
  artworkId: string
}
