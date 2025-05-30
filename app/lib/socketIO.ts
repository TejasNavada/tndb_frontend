import {io} from "socket.io-client"
import Cookies from 'js-cookie';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

export let socket: any | null = null;

export function initSocketConnection() {
  const token = Cookies.get('tndb_token');

  if (!token) {
    console.warn("Token not available. Socket not initialized.");
    return;
  }
  console.log("Sending this token" +token)
  socket = io(import.meta.env.VITE_SOCKET_API+"?token="+token, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });
}