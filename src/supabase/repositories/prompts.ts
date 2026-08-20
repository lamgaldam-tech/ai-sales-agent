import { supabase } from "@/supabase/client.js";
import type { Database } from "@/supabase/types.js";

export type Prompts = Database["public"]["Tables"]["prompts"];

async function getBusinessPrompts(businessesId: string) {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("businesses_id", businessesId);
  if (error) throw error;
  return data;
}

export { getBusinessPrompts };
