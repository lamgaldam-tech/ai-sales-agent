import cors from "cors";
import express from "express";
import { getUser } from "@/api/middleware.js";
import { getConnection } from "@/baileys/index.js";
import {
  fetchBusinessProducts,
  integrationsAuth,
} from "@/integrations/index.js";
import { getBusinessIntegrations } from "@/supabase/index.js";
import type { Integrations } from "@/supabase/index.js";

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

app.get("/integrations", async (req, res) => {
  let user;

  try {
    user = await getUser(req);
  } catch {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const integrations = await getBusinessIntegrations(user.id);

    return res.status(200).json({
      integrations: integrations.map((integration) => ({
        id: integration.id,
        name: integration.name,
        type: integration.type,
        identifier: integration.identifier,
        connected: integration.access_token !== "",
      })),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch integrations",
    });
  }
});

app.get("/integrations/:type/:identifier/redirect", async (req, res) => {
  const { type, identifier } = req.params;

  const redirectHandler =
    integrationsAuth.redirect[type as Integrations["Row"]["type"]];
  if (!redirectHandler) {
    return res.status(400).json({ error: `Unsupported integration type` });
  }

  return res.redirect(
    redirectHandler(identifier, req.query as Record<string, string>),
  );
});

app.get("/integrations/:type/:identifier/callback", async (req, res) => {
  const { type, identifier } = req.params;

  const callbackHandler =
    integrationsAuth.callback[type as Integrations["Row"]["type"]];
  if (!callbackHandler) {
    return res.status(400).json({ error: `Unsupported integration type` });
  }

  try {
    await callbackHandler(identifier, req.query as Record<string, string>);

    return res.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: "OAUTH_COMPLETE", status: "success" }, "*");
            }
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: "OAUTH_COMPLETE", 
                status: "error", 
                error: "OAuth authentication failed" 
              }, "*");
            }
            window.close();
          </script>
        </body>
      </html>
    `);
  }
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
