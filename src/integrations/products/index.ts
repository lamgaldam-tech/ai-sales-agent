import { getBusinessIntegrations } from "@/supabase/index.js";
import { sheetsProducts } from "@/integrations/products/sheets.js";
import { shopifyProducts } from "@/integrations/products/shopify.js";
import { youcanProducts } from "@/integrations/products/youcan.js";

const handlersMap = {
  google_sheets: sheetsProducts,
  shopify: shopifyProducts,
  youcan: youcanProducts,
};

async function fetchBusinessProducts(businessId: string) {
  const integrations = await getBusinessIntegrations(businessId);
  const products = await Promise.all(
    integrations
      .filter((integrations) => integrations.access_token)
      .map((integration) => handlersMap[integration.type](integration)),
  );
  return [
    ...new Map(
      products.flat().map((product) => [product.name, product]),
    ).values(),
  ];
}

export { fetchBusinessProducts };
