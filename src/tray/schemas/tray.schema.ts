import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrayDocument = TrayModel & Document;

@Schema()
export class TrayModel {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: [String], default: [] })
  plants: string[];
}

export const TraySchema = SchemaFactory.createForClass(TrayModel);
