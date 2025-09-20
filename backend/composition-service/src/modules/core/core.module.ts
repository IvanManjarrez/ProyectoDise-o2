import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Artwork, ArtworkSchema } from './schemas/artwork.schema';
import { Museum, MuseumSchema } from './schemas/museum.schema';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { ViewLog, ViewLogSchema } from './schemas/view-log.schema';
import { UserService } from './services/user.service';
import { ArtworkService } from './services/artwork.service';
import { MuseumService } from './services/museum.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Artwork.name, schema: ArtworkSchema },
      { name: Museum.name, schema: MuseumSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: ViewLog.name, schema: ViewLogSchema },
    ]),
  ],
  providers: [UserService, ArtworkService, MuseumService],
  exports: [UserService, ArtworkService, MuseumService],
})
export class CoreModule {}