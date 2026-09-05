import { supabase } from "@/supabase/client.js";
import type { Database } from "@/supabase/types.js";

export type Customers = Database["public"]["Tables"]["customers"];

async function upsertCustomer(businessId: string, phone: string) {
  const { data, error } = await supabase
    .from("customers")
    .upsert(
      { business_id: businessId, phone },
      { onConflict: "business_id,phone" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateCustomer(
  customerId: string,
  customer: Customers["Update"],
) {
  const { error } = await supabase
    .from("customers")
    .update(customer)
    .eq("id", customerId);
  if (error) throw error;
}

export { upsertCustomer, updateCustomer };
