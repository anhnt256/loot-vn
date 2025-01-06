// types/socket.ts
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export interface ServerToClientEvents {
  counter: (value: number) => void;
}

export interface ClientToServerEvents {
  // Định nghĩa các events từ client tới server nếu cần
}

export interface SocketData {
  counter: number;
}
