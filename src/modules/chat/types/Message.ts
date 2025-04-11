export interface Message {
    id: string;
    userId: string;
    isFrom: boolean;
    roomId: string;
    text: string;
  }