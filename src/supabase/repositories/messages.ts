import { supabase } from "@/supabase/client.js";
import type { Database } from "@/supabase/types.js";

export type Messages = Database["public"]["Tables"]["messages"];

async function getCustomerMessages(customerId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

async function insertMessages(messages: Messages["Insert"][]) {
  const { error } = await supabase.from("messages").insert(messages);
  if (error) throw error;
}

export { getCustomerMessages, insertMessages };
