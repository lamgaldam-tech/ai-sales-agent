import makeWASocket from "@whiskeysockets/baileys";

export interface Connection {
  connected: boolean;
  qr: string;
  socket: ReturnType<typeof makeWASocket>;
  deleting: boolean;
}