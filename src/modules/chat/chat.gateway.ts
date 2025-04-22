import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ClientToServerListen, ServerToClientListen } from "./types/WebSocketListen";
import { Message } from "./types/Message";
import { ChatService } from "./chat.service";
import { Inject } from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  constructor(@Inject(ChatService) private chatService: ChatService){}
  @WebSocketServer() server: Server<ClientToServerListen, ServerToClientListen>

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() rawMessage: Message
  ) {
    const fullMessage: Message = {
      ...rawMessage,
      isFrom: true,
    };
  
    await this.chatService.saveMessage(fullMessage);
    this.server.to(rawMessage.roomId).emit('message', fullMessage);
  }
  

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) {
    client.join(roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) { 
    client.leave(roomId); 
  }

  @SubscribeMessage('loadMessages')
  async handleLoadMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) {
    const messages = await this.chatService.getMessages(roomId);
    client.emit('messageHistory', messages.reverse());
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log("Connect");
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log("Disconnect");    
  }
 }