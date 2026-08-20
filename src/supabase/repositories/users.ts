import { supabase } from "@/supabase/client.js";

async function getUserByToken(token: string) {
  const { data: user, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error("Invalid authentication token");
  return user;
}

export { getUserByToken };
