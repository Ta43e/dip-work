import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type MessageDocument = Message & Document;
@Schema({ timestamps: true })
export class Message {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Boolean, required: true })
  isFrom: boolean;

  @Prop({ type: String, required: true })
  roomId: string;

  @Prop({ type: String }) // текст или base64
  text?: string;

  @Prop({ type: Boolean, default: false })
  isImage?: boolean;

  @Prop({ type: Boolean, default: false })
  isFile?: boolean;

  @Prop({ type: String })
  fileName?: string;

  @Prop({ type: Number }) // в байтах
  fileSize?: number;

  @Prop({ type: String })
  fileType?: string;
}



export const MessageSchema = SchemaFactory.createForClass(Message);
