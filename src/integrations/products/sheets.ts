import { upsertIntegration } from "@/supabase/index.js";
import type { Integrations } from "@/supabase/index.js";
import type { Product } from "@/integrations/types.js";

function parseProducts(data: { values?: string[][] }): Product[] {
  const rows = data.values ?? [];

  if (rows.length === 0 || !rows[0]) return [];

  const headers = rows[0].map((header) => header.trim().toLowerCase());

  const name = headers.indexOf("name");
  const description = headers.indexOf("description");
  const price = headers.indexOf("price");
  const quantity = headers.indexOf("quantity");

  if (name === -1 || description === -1 || price === -1 || quantity === -1) {
    return [];
  }

  return rows.slice(1).map((row) => ({
    name: row[name] ?? "",
    description: row[description] ?? "",
    price: Number(row[price] ?? 0),
    quantity: Number(row[quantity] ?? 0),
  }));
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) return;
  return ((await response.json()) as { access_token: string }).access_token;
}

async function fetchSheet(spreadsheetId: string, accessToken: string) {
  return fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}

async function sheetsProducts(integration: Integrations["Row"]) {
  let response = await fetchSheet(
    integration.identifier,
    integration.access_token,
  );

  if (response.ok) return parseProducts((await response.json()) as any);
  if (response.status !== 401 && response.status !== 403) {
    throw new Error(`Google Sheets request failed: ${response.status}`);
  }

  const accessToken = await refreshAccessToken(integration.refresh_token);
  if (!accessToken) {
    await upsertIntegration(integration.businesses_id, {
      ...integration,
      access_token: "",
      refresh_token: "",
    });
    return [];
  }
  await upsertIntegration(integration.businesses_id, {
    ...integration,
    access_token: accessToken,
  });

  response = await fetchSheet(integration.identifier, accessToken);
  if (response.ok) return parseProducts((await response.json()) as any);
  if (response.status === 401 || response.status === 403) {
    await upsertIntegration(integration.businesses_id, {
      ...integration,
      access_token: "",
      refresh_token: "",
    });
    return [];
  }

  throw new Error(`Google Sheets request failed: ${response.status}`);
}

export { sheetsProducts };
