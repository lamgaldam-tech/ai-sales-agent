import { supabase } from "@/supabase/client.js";
import type { Database } from "@/supabase/types.js";

export type Integrations = Database["public"]["Tables"]["integrations"];

async function getBusinessIntegrations(businessId: string) {
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("businesses_id", businessId);
  if (error) throw error;
  return data;
}

async function upsertIntegration(
  businessId: string,
  integration: Integrations["Insert"],
) {
  const { error } = await supabase
    .from("integrations")
    .upsert(
      {
        ...integration,
        businesses_id: businessId,
      },
      {
        onConflict: "businesses_id,identifier,type",
      },
    )
    .select()
    .single();
  if (error) throw error;
}

export { getBusinessIntegrations, upsertIntegration };
