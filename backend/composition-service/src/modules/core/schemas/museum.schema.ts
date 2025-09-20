import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Museum extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  source: string; // 'louvre', 'met', 'prado', etc.

  @Prop()
  description?: string;

  @Prop()
  website?: string;

  @Prop()
  location?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const MuseumSchema = SchemaFactory.createForClass(Museum);