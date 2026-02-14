import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 20000,
});
