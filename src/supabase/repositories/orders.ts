import { supabase } from "@/supabase/client.js";
import type { Database } from "@/supabase/types.js";

export type Orders = Database["public"]["Tables"]["orders"];

async function createOrder(customerId: string) {
  const { data: existingOrder, error: checkError } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_id", customerId)
    .eq("revenue", 0)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existingOrder) return;

  const { error } = await supabase
    .from("orders")
    .insert({ customer_id: customerId });

  if (error) throw error;
}

async function updateActiveOrder(customerId: string, revenue: number) {
  const { error } = await supabase
    .from("orders")
    .update({ revenue })
    .eq("customer_id", customerId)
    .eq("revenue", 0)
    .order("created_at", { ascending: true })
    .limit(1)
    .select()
    .single();

  if (error) throw error;
}

export { createOrder, updateActiveOrder };
