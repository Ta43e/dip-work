import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
    #clients: Socket[] = [];
    constructor(
        @InjectModel(Message.name)
        private messageModel: Model<MessageDocument>,
      ) {}
      
    async saveMessage(data: Partial<Message>): Promise<Message> {
        const created = new this.messageModel(data);
        return created.save();
      }
    
      async getMessages(roomId: string, limit = 50): Promise<Message[]> {
        return this.messageModel
          .find({ roomId })
          .sort({ createdAt: -1 }) 
          .limit(limit)
          .exec();
      }

    addClient(client: Socket): void {
        this.#clients.push(client)
        console.log(this.#clients.length)
    }   
    removeClinet (id: string) {
        this.#clients = this.#clients.filter( clinet => clinet.id !== id)
        console.log(this.#clients.length)
    }
    getClientId(id: String): Socket | null {
        const client = this.#clients.find(client => client.id === id);
        if (client) return client;
        return null;
    }
}
