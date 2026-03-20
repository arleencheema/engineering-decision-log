"use server";

import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function deleteDecision(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("decisions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  redirect("/");
}