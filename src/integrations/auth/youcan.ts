import { upsertIntegration } from "@/supabase/index.js";

const APP_URL = process.env.APP_URL!;
const YOUCAN_CLIENT_ID = process.env.YOUCAN_CLIENT_ID!;
const YOUCAN_CLIENT_SECRET = process.env.YOUCAN_CLIENT_SECRET!;

const youcanRedirect = (identifier: string) => {
  const params = new URLSearchParams();

  params.set("client_id", YOUCAN_CLIENT_ID);
  params.set(
    "redirect_uri",
    `${APP_URL}/integrations/youcan/${identifier}/callback`,
  );
  params.set("response_type", "code");
  params.append("scope[]", "read-products");
  params.set("state", identifier);

  return `https://seller-area.youcan.shop/admin/oauth/authorize?${params.toString()}`;
};

const youcanCallBack = async (
  identifier: string,
  query: Record<string, string>,
) => {
  const { code, state, error } = query;

  if (error) {
    throw new Error(`YouCan OAuth error: ${error}`);
  }

  if (!code) {
    throw new Error("Missing YouCan authorization code");
  }

  if (state !== identifier) {
    throw new Error("Invalid OAuth state");
  }

  const redirectUri =
    `${APP_URL}/integrations/youcan/${identifier}/callback`;

  const response = await fetch(
    "https://api.youcan.shop/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: YOUCAN_CLIENT_ID,
        client_secret: YOUCAN_CLIENT_SECRET,
        redirect_uri: redirectUri,
        code,
      }),
    },
  );

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
    identifier,
    name: identifier,
    type: "youcan",
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    businesses_id: identifier,
  });
};

export { youcanRedirect, youcanCallBack };