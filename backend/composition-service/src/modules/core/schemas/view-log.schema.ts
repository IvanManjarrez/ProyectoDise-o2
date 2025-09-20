import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ViewLog extends Document {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, ref: 'Artwork' })
  artworkId: Types.ObjectId;

  @Prop({ required: true })
  viewedAt: Date;

  @Prop()
  duration?: number; // seconds

  @Prop()
  source?: string; // where the view originated
}

export const ViewLogSchema = SchemaFactory.createForClass(ViewLog);