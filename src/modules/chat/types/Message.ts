export interface Message {
    id: string;
    socketId: string;
    isFrom: boolean;
    roomId: string;
    text: string;
  }