import { upsertIntegration } from "@/supabase/index.js";
import type {
  IntegrationRedirect,
  IntegrationCallback,
} from "@/integrations/types.js";

const API_HOST = process.env.API_HOST!;
const YOUCAN_CLIENT_ID = process.env.YOUCAN_CLIENT_ID!;
const YOUCAN_SECRET_ID = process.env.YOUCAN_SECRET_ID!;

const youcanRedirect: IntegrationRedirect = (businessId, name) => {
  const params = new URLSearchParams({
    client_id: YOUCAN_CLIENT_ID,
    scope: "read-products",
    redirect_uri: `${API_HOST}/integrations/youcan/callback`,
    response_type: "code",
    state: `${businessId}|${name}`,
  });

  upsertIntegration({
    business_id: businessId,
    identifier: name,
    name,
    type: "youcan",
    access_token: "",
    refresh_token: "",
  });
  return `https://seller-area.youcan.shop/admin/oauth/authorize?${params.toString()}`;
};

const youcanCallBack: IntegrationCallback = async (businessId, name, code) => {
  if (!code) {
    throw new Error("Missing YouCan authorization code");
  }

  const response = await fetch("https://api.youcan.shop/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: YOUCAN_CLIENT_ID,
      client_secret: YOUCAN_SECRET_ID,
      redirect_uri: `${API_HOST}/integrations/callback`,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`YouCan OAuth failed: ${error}`);
  }

  const data = (await response.json()) as {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
  };

  await upsertIntegration({
    business_id: businessId,
    identifier: name,
    name,
    type: "youcan",
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
};

export { youcanRedirect, youcanCallBack };
