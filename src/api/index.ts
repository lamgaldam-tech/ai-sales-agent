import express from "express";
import cors from "cors";
import { getUser } from "@/api/middleware.js";
import { getConnection } from "@/baileys/index.js";
import { fetchBusinessProducts } from "@/integrations/index.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/connection", async (req, res) => {
  let user;
  try {
    user = await getUser(req);
  } catch (error) {
    return res.status(401).json({ error });
  }

  const connection = getConnection(user.id);
  if (!connection) {
    return res.status(404).json({
      error: "No WhatsApp connection found",
    });
  }

  return res.status(200).json({
    connected: connection.connected,
    qr: connection.qr,
  });
});

app.get("/products", async (req, res) => {
  let user;

  try {
    user = await getUser(req);
  } catch {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const products = await fetchBusinessProducts(user.id);

    return res.status(200).json({
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to fetch products",
    });
  }
});

app.post("/broadcast", async (req, res) => {
  let user;
  try {
    user = await getUser(req);
  } catch (error) {
    return res.status(401).json({ error });
  }

  const connection = getConnection(user.id);
  if (!connection) {
    return res.status(404).json({
      error: "No WhatsApp connection found",
    });
  }

  const messages = req.body.messages as { phone: string; message: string }[];
  if (!messages) {
    return res.status(400).json({ error: "" });
  }

  try {
    await Promise.all(
      messages.map((message) =>
        connection.socket.sendMessage(message.phone, { text: message.message }),
      ),
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(503).json({ error });
  }
});
