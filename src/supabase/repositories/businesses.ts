import { supabase } from "@/supabase/client.js";
import type { Database } from "@/supabase/types.js";

export type Businesses = Database["public"]["Tables"]["businesses"];

async function getBusinessesIds() {
  const { data, error } = await supabase
    .from("businesses")
    .select("businesses_id");
  if (error) throw error;
  return data;
}

async function getBusinessById(businessesId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("businesses_id", businessesId)
    .single();
  if (error) throw error;
  return data;
}

async function subscribeToBusinessesChanges(
  onInsert: (businessesId: string) => void,
  onDelete: (businessesId: string) => void,
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
      (payload) => onInsert(payload.new.businesses_id),
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "businesses",
      },
      (payload) => onDelete(payload.old.businesses_id),
    )
    .subscribe();
}

export { getBusinessById, getBusinessesIds, subscribeToBusinessesChanges };
