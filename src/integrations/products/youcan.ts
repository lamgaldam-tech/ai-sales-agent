import { upsertIntegration } from "@/supabase/index.js";
import type { Integrations } from "@/supabase/index.js";
import type { Product } from "@/integrations/types.js";

interface YouCanProduct {
  name: string;
  description?: string;
  price: number;
  inventory?: number;
  quantity?: number;
}

function parseYouCanProducts(data: { data?: YouCanProduct[] }): Product[] {
  const products = data.data ?? [];

  return products.map((product) => ({
    name: product.name ?? "",
    description: product.description ?? "",
    price: Number(product.price ?? 0),
    quantity: Number(product.quantity ?? product.inventory ?? 0),
  }));
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://api.youcan.shop/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.YOUCAN_CLIENT_ID!,
      client_secret: process.env.YOUCAN_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) return;

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

async function fetchYouCanProducts(accessToken: string) {
  return fetch("https://api.youcan.shop/products", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

async function youcanProducts(
  integration: Integrations["Row"],
): Promise<Product[]> {
  let response = await fetchYouCanProducts(integration.access_token);

  if (response.ok) {
    return parseYouCanProducts((await response.json()) as any);
  }

  if (response.status !== 401 && response.status !== 403) {
    throw new Error(`YouCan request failed: ${response.status}`);
  }

  const tokens = await refreshAccessToken(integration.refresh_token);

  if (!tokens?.accessToken) {
    await upsertIntegration(integration.businesses_id, {
      ...integration,
      access_token: "",
      refresh_token: "",
    });
    return [];
  }

  await upsertIntegration(integration.businesses_id, {
    ...integration,
    access_token: tokens.accessToken,
    ...(tokens.refreshToken ? { refresh_token: tokens.refreshToken } : {}),
  });

  response = await fetchYouCanProducts(tokens.accessToken);

  if (response.ok) {
    return parseYouCanProducts((await response.json()) as any);
  }

  if (response.status === 401 || response.status === 403) {
    await upsertIntegration(integration.businesses_id, {
      ...integration,
      access_token: "",
      refresh_token: "",
    });
    return [];
  }

  throw new Error(`YouCan request failed: ${response.status}`);
}

export { youcanProducts };
