import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Favorite extends Document {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, ref: 'Artwork' })
  artworkId: Types.ObjectId;

  @Prop()
  notes?: string;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);