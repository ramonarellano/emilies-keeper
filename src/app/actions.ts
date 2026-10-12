"use server";

import { redirect } from "next/navigation";
import { lagSupabaseServer } from "@/lib/supabase/server";

export async function loggUt() {
  const supabase = await lagSupabaseServer();
  await supabase.auth.signOut();
  redirect("/logg-inn");
}
