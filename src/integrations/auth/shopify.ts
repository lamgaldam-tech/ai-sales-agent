import { upsertIntegration } from "@/supabase/index.js";

const APP_URL = process.env.APP_URL!;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;

const shopifyRedirect = (identifier: string) => {
  const params = new URLSearchParams({
    client_id: SHOPIFY_CLIENT_ID,
    scope: "read_products",
    redirect_uri: `${APP_URL}/integrations/shopify/${identifier}/callback`,
    state: identifier,
  });
  return `https://${identifier}/admin/oauth/authorize?${params.toString()}`;
};

const shopifyCallBack = async (
  identifier: string,
  query: Record<string, string>,
) => {
  const { code, shop, state } = query;

  if (!code) {
    throw new Error("Missing Shopify authorization code");
  }

  if (!shop) {
    throw new Error("Missing Shopify shop");
  }

  if (state !== identifier) {
    throw new Error("Invalid OAuth state");
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shopify OAuth failed: ${error}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    scope: string;
  };

  await upsertIntegration({
    identifier: shop,
    name: shop,
    type: "shopify",
    access_token: data.access_token,
    refresh_token: "",
    businesses_id: identifier,
  });
};

export { shopifyRedirect, shopifyCallBack };
