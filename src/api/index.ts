import cors from "cors";
import express from "express";
import { getUser } from "@/api/middleware.js";
import { ApiError, sendError, sendResponse } from "@/api/response.js";
import { getConnection } from "@/baileys/index.js";
import {
  fetchBusinessProducts,
  integrationsAuth,
} from "@/integrations/index.js";
import { getBusinessById, getBusinessIntegrations } from "@/supabase/index.js";
import type { Integrations } from "@/supabase/index.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/connection", async (req, res) => {
  try {
    const user = await getUser(req);
    const connection = getConnection(user.id);
    if (!connection) {
      throw new ApiError(404, "No WhatsApp connection found");
    }
    return sendResponse(res, 200, {
      connected: connection.connected,
      qr: connection.qr,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/integrations", async (req, res) => {
  try {
    const user = await getUser(req);
    const integrations = await getBusinessIntegrations(user.id);
    return sendResponse(res, 200, {
      integrations: integrations.map((integration) => ({
        id: integration.id,
        name: integration.name,
        type: integration.type,
        identifier: integration.identifier,
        connected: integration.access_token !== "",
      })),
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/integrations/:businessId/:name/:type/redirect", async (req, res) => {
  const { businessId, name, type } = req.params;

  try {
    const redirectHandler =
      integrationsAuth.redirect[type as Integrations["Row"]["type"]];
    if (!redirectHandler) {
      throw new ApiError(401, "Unsupported integration type");
    }

    return res.redirect(redirectHandler(businessId, name));
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/integrations/:type/callback", async (req, res) => {
  const { type } = req.params;
  const { code, shop, state } = req.query;

  try {
    if (!state || typeof state !== "string") {
      throw new ApiError(400, "state not provided or invalid");
    }
    const [businessId, name] = state.split("|");
    if (!businessId || typeof businessId !== "string") {
      throw new ApiError(400, "id not provided or invalid");
    }
    if (!name || typeof name !== "string") {
      throw new ApiError(400, "name not provided or invalid");
    }

    await getBusinessById(businessId);

    const callbackHandler =
      integrationsAuth.callback[type as Integrations["Row"]["type"]];
    if (!callbackHandler) {
      throw new ApiError(401, "Unsupported integration type");
    }

    await callbackHandler(businessId, name, code as string, shop as string);
    return res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <script>
        window.close();
      </script>
    </html>
    `);
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/products", async (req, res) => {
  try {
    const user = await getUser(req);
    const products = await fetchBusinessProducts(user.id);
    return sendResponse(res, 200, { products });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/broadcast", async (req, res) => {
  try {
    const user = await getUser(req);
    const connection = getConnection(user.id);
    if (!connection) {
      throw new ApiError(404, "No WhatsApp connection found");
    }
    const messages =
      (req.body.messages as { phone: string; message: string }[]) || [];

    await Promise.all(
      messages.map((message) =>
        connection.socket.sendMessage(message.phone, {
          text: message.message,
        }),
      ),
    );
    return sendResponse(res, 200, { success: true });
  } catch (error) {
    return sendError(res, error);
  }
});
