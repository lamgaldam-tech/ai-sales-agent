import { upsertIntegration } from "@/supabase/index.js";
import type {
  IntegrationRedirect,
  IntegrationCallback,
} from "@/integrations/types.js";

const API_HOST = process.env.API_HOST!;
const GOOGLE_SHEETS_CLIENT_ID = process.env.GOOGLE_SHEETS_CLIENT_ID!;
const GOOGLE_SHEETS_SECRET_ID = process.env.GOOGLE_SHEETS_SECRET_ID!;

const sheetsRedirect: IntegrationRedirect = (businessId, name) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_SHEETS_CLIENT_ID,
    redirect_uri: `${API_HOST}/integrations/google_sheets/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    access_type: "offline",
    prompt: "consent",
    state: `${businessId}|${name}`,
  });
  upsertIntegration({
    business_id: businessId,
    identifier: name,
    name,
    type: "google_sheets",
    access_token: "",
    refresh_token: "",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const sheetsCallBack: IntegrationCallback = async (businessId, name, code) => {
  if (!code) {
    throw new Error("Missing Google authorization code");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_SHEETS_CLIENT_ID,
      client_secret: GOOGLE_SHEETS_SECRET_ID,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${API_HOST}/integrations/google_sheets/callback`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google OAuth failed: ${error}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
  };

  if (!data.access_token) {
    throw new Error("Missing Google access token");
  }

  await upsertIntegration({
    business_id: businessId,
    identifier: name,
    name,
    type: "google_sheets",
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? "",
  });
};

export { sheetsRedirect, sheetsCallBack };
