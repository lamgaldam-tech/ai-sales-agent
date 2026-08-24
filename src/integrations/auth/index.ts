import {
  shopifyRedirect,
  shopifyCallBack,
} from "@/integrations/auth/shopify.js";
import { youcanRedirect, youcanCallBack } from "@/integrations/auth/youcan.js";
import { sheetsRedirect, sheetsCallBack } from "@/integrations/auth/sheets.js";

export const integrationsAuth = {
  redirect: {
    shopify: shopifyRedirect,
    youcan: youcanRedirect,
    google_sheets: sheetsRedirect,
  },
  callback: {
    shopify: shopifyCallBack,
    youcan: youcanCallBack,
    google_sheets: sheetsCallBack,
  },
};
