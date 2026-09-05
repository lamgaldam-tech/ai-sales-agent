import { sheetsRedirect, sheetsCallBack } from "@/integrations/auth/sheets.js";
import {
  shopifyRedirect,
  shopifyCallBack,
} from "@/integrations/auth/shopify.js";
import { youcanRedirect, youcanCallBack } from "@/integrations/auth/youcan.js";

export const integrationsAuth = {
  redirect: {
    google_sheets: sheetsRedirect,
    shopify: shopifyRedirect,
    youcan: youcanRedirect,
  },
  callback: {
    google_sheets: sheetsCallBack,
    shopify: shopifyCallBack,
    youcan: youcanCallBack,
  },
};
