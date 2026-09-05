import { supabase } from "@/supabase/client.js";
import type { Database } from "@/supabase/types.js";

export type Integrations = Database["public"]["Tables"]["integrations"];

async function getBusinessIntegrations(businessId: string) {
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("business_id", businessId);
  if (error) throw error;
  return data;
}

async function upsertIntegration(integration: Integrations["Insert"]) {
  const { error } = await supabase
    .from("integrations")
    .upsert(integration, {
      onConflict: "business_id,name,type",
    })
    .select()
    .single();
  if (error) throw error;
}

export { getBusinessIntegrations, upsertIntegration };
