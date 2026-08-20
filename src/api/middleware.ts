import { getUserByToken } from "@/supabase/index.js";
import type { Request } from "express";

async function getUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Invalid authentication token");
  }
  const { user } = await getUserByToken(authHeader.substring(7));
  return user;
}

export { getUser };
