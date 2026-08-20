import { upsertIntegration } from "@/supabase/index.js";
import type { Integrations } from "@/supabase/index.js";
import type { Product } from "@/integrations/types.js";

async function shopifyProducts(
  integration: Integrations["Row"],
): Promise<Product[]> {
  const query = `
    query GetProducts {
      products(first: 100) {
        nodes {
          title
          description
          totalInventory
          priceRangeV2 {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  `;

  const response = await fetch(
    `https://${integration.identifier}/admin/api/2026-07/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": integration.access_token,
      },
      body: JSON.stringify({ query }),
    },
  );

  if (response.status === 401 || response.status === 403) {
    await upsertIntegration(integration.businesses_id, {
      ...integration,
      access_token: "",
    });
    return [];
  }

  if (!response.ok) {
    throw new Error(`Shopify request failed: ${response.status}`);
  }

  const result = (await response.json()) as {
    data?: {
      products?: {
        nodes: {
          title: string;
          description: string;
          totalInventory: number;
          priceRangeV2: {
            minVariantPrice: {
              amount: string;
            };
          };
        }[];
      };
    };
  };

  return (result.data?.products?.nodes ?? []).map((product) => ({
    name: product.title,
    description: product.description,
    price: Number(product.priceRangeV2.minVariantPrice.amount),
    quantity: product.totalInventory,
  }));
}

export { shopifyProducts };
