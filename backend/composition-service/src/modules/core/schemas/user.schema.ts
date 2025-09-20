import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  avatar?: string;

  @Prop({ default: [] })
  preferences: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);