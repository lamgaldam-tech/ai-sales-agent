import { upsertIntegration } from "@/supabase/index.js";

const APP_URL = process.env.APP_URL!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

const sheetsRedirect = (identifier: string) => {
  const redirectUri = `${APP_URL}/integrations/google_sheets/${identifier}/callback`;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state: identifier,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const sheetsCallBack = async (
  identifier: string,
  query: Record<string, string>,
) => {
  const { code, state, error } = query;

  if (error) {
    throw new Error(`Google OAuth error: ${error}`);
  }

  if (!code) {
    throw new Error("Missing Google authorization code");
  }

  if (state !== identifier) {
    throw new Error("Invalid OAuth state");
  }

  const redirectUri = `${APP_URL}/integrations/google_sheets/${identifier}/callback`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google OAuth failed: ${error}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };

  if (!data.refresh_token) {
    throw new Error("Google did not return a refresh token");
  }

  await upsertIntegration({
    identifier,
    name: "Google Sheets",
    type: "google_sheets",
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    businesses_id: identifier,
  });
};

export { sheetsRedirect, sheetsCallBack };
