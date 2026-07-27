"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AccountAttributes, AccountKind } from "@/lib/supabase/types";

function buildAttributes(kind: AccountKind, formData: FormData): AccountAttributes {
  if (kind === "metal") {
    return {
      metal_type: (formData.get("metal_type") as AccountAttributes["metal_type"]) ?? "gold",
      unit: (formData.get("unit") as AccountAttributes["unit"]) ?? "oz",
    };
  }
  if (kind === "other_investment") {
    return {
      symbol: (formData.get("symbol") as string) ?? "",
      asset_type: (formData.get("asset_type") as AccountAttributes["asset_type"]) ?? "stock",
    };
  }
  return {};
}

export async function createAccount(profileId: string, formData: FormData) {
  const supabase = await createClient();
  const kind = formData.get("kind") as AccountKind;
  const name = formData.get("name") as string;
  const currency = (formData.get("currency") as string) || "COP";

  const { error } = await supabase.from("accounts").insert({
    profile_id: profileId,
    kind,
    name,
    currency,
    attributes: buildAttributes(kind, formData),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/profiles/${profileId}/accounts`);
  redirect(`/profiles/${profileId}/accounts`);
}

export async function updateAccount(profileId: string, accountId: string, formData: FormData) {
  const supabase = await createClient();
  const kind = formData.get("kind") as AccountKind;
  const name = formData.get("name") as string;
  const currency = (formData.get("currency") as string) || "COP";

  const { error } = await supabase
    .from("accounts")
    .update({
      name,
      currency,
      attributes: buildAttributes(kind, formData),
    })
    .eq("id", accountId);

  if (error) throw new Error(error.message);

  revalidatePath(`/profiles/${profileId}/accounts`);
  redirect(`/profiles/${profileId}/accounts`);
}

export async function deactivateAccount(profileId: string, accountId: string) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.from("accounts").update({ is_active: false }).eq("id", accountId);
  if (error) throw new Error(error.message);
  revalidatePath(`/profiles/${profileId}/accounts`);
}
