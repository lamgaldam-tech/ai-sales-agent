import { supabase } from "@/supabase/client.js";
import type { Database } from "@/supabase/types.js";

export type Businesses = Database["public"]["Tables"]["businesses"];

async function getBusinessesIds() {
  const { data, error } = await supabase
    .from("businesses")
    .select("id");
  if (error) throw error;
  return data;
}

async function getBusinessById(businessId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();
  if (error) throw error;
  return data;
}

async function subscribeToBusinessesChanges(
  onInsert: (businessId: string) => void,
  onDelete: (businessId: string) => void,
) {
  supabase
    .channel("businesses")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "businesses",
      },
      (payload) => onInsert(payload.new.id),
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "businesses",
      },
      (payload) => onDelete(payload.old.id),
    )
    .subscribe();
}

export { getBusinessById, getBusinessesIds, subscribeToBusinessesChanges };
