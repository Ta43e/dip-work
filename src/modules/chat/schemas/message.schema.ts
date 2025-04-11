import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: String, required: true })
  socketId: string;

  @Prop({ type: Boolean, required: true })
  isFrom: boolean;

  @Prop({ type: String, required: true })
  roomId: string;

  @Prop({ type: String, required: true })
  text: string;
}


export const MessageSchema = SchemaFactory.createForClass(Message);
