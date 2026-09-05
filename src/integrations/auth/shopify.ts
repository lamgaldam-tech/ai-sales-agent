import { upsertIntegration } from "@/supabase/index.js";
import type {
  IntegrationRedirect,
  IntegrationCallback,
} from "@/integrations/types.js";

const API_HOST = process.env.API_HOST!;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_SECRET_ID = process.env.SHOPIFY_SECRET_ID!;

const shopifyRedirect: IntegrationRedirect = (businessId, name) => {
  const params = new URLSearchParams({
    client_id: SHOPIFY_CLIENT_ID,
    scope: "read_products",
    redirect_uri: `${API_HOST}/integrations/shopify/callback`,
    state: `${businessId}|${name}`,
  });
  upsertIntegration({
    business_id: businessId,
    identifier: name,
    name,
    type: "shopify",
    access_token: "",
    refresh_token: "",
  });
  return `https://${name}/admin/oauth/authorize?${params.toString()}`;
};

const shopifyCallBack: IntegrationCallback = async (
  businessId,
  name,
  code,
  shop,
) => {
  if (!code) {
    throw new Error("Missing Shopify authorization code");
  }

  if (!shop) {
    throw new Error("Missing Shopify shop");
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_SECRET_ID,
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
    business_id: businessId,
    identifier: shop,
    name,
    type: "shopify",
    access_token: data.access_token,
    refresh_token: "",
  });
};

export { shopifyRedirect, shopifyCallBack };
