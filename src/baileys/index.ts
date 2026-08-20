import { rm } from "node:fs/promises";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { handleCustomerMessage } from "@/baileys/handler/index.js";
import type { Connection } from "@/baileys/types.js";

const connections = new Map<string, Connection>();

const getConnection = (businessesId: string) => connections.get(businessesId);

async function removeBaileysConnection(businessesId: string, isLoggedOut?: true) {
  if (!isLoggedOut) {
    const connection = connections.get(businessesId);
    if (connection) {
      connection.deleting = true;
      await connection.socket.logout();
      connection.socket.end(undefined);
    }
  }
  connections.delete(businessesId);
  await rm(`./auth/${businessesId}`, {
    recursive: true,
    force: true,
  });
}

async function createBaileysConnection(businessesId: string) {
  const { state, saveCreds } = await useMultiFileAuthState(`./auth/${businessesId}`);
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
  connections.set(businessesId, connection);

  sock.ev.on("connection.update", (update) => {
    const { connection: conn, qr, lastDisconnect } = update;
    if (qr) connection.qr = qr;
    if (conn === "open") connection.connected = true;
    if (conn === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      if (isLoggedOut)
        removeBaileysConnection(businessesId, true).catch(console.error);
      if (!connection.deleting) createBaileysConnection(businessesId);
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
      handleCustomerMessage(businessesId, connection, text, jid).catch(console.error);
    }
  });
}

export { getConnection, createBaileysConnection, removeBaileysConnection };
