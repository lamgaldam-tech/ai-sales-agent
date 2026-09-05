import { rm } from "node:fs/promises";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { handleCustomerMessage } from "@/baileys/handler/index.js";
import type { Connection } from "@/baileys/types.js";

const connections = new Map<string, Connection>();

const getConnection = (businessId: string) => connections.get(businessId);

async function removeBaileysConnection(businessId: string, isLoggedOut?: true) {
  if (!isLoggedOut) {
    const connection = connections.get(businessId);
    if (connection) {
      connection.deleting = true;
      await connection.socket.logout();
      connection.socket.end(undefined);
    }
  }
  connections.delete(businessId);
  await rm(`./auth/${businessId}`, {
    recursive: true,
    force: true,
  });
}

async function createBaileysConnection(businessId: string) {
  const { state, saveCreds } = await useMultiFileAuthState(`./auth/${businessId}`);
  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  const connection = {
    connected: false,
    qr: "",
    socket: sock,
    deleting: false,
  };
  connections.set(businessId, connection);

  sock.ev.on("connection.update", (update) => {
    const { connection: conn, qr, lastDisconnect } = update;
    if (qr) connection.qr = qr;
    if (conn === "open") connection.connected = true;
    if (conn === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      if (isLoggedOut)
        removeBaileysConnection(businessId, true).catch(console.error);
      if (!connection.deleting) createBaileysConnection(businessId);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      const jid = msg.key.remoteJidAlt;
      if (!jid || jid.endsWith("@g.us")) continue;

      const text =
        msg.message?.conversation ?? msg.message?.extendedTextMessage?.text;
      if (!text) continue;
      handleCustomerMessage(businessId, connection, text, jid).catch(console.error);
    }
  });
}

export { getConnection, createBaileysConnection, removeBaileysConnection };
