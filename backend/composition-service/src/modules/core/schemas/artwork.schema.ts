import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Artwork extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  artist: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  museumId: string;

  @Prop({ required: true })
  externalId: string;

  @Prop({ required: true })
  source: string; // 'louvre', 'met', 'prado', etc.

  @Prop()
  year?: number;

  @Prop()
  medium?: string;

  @Prop()
  dimensions?: string;

  @Prop({ default: [] })
  tags: string[];
}

export const ArtworkSchema = SchemaFactory.createForClass(Artwork);