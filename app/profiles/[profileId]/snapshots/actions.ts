"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { valuateSnapshot } from "@/lib/valuation";
import type { Account } from "@/lib/supabase/types";

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function saveSnapshots(profileId: string, month: string, formData: FormData) {
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("profile_id", profileId)
    .eq("is_active", true);

  for (const account of (accounts ?? []) as Account[]) {
    const quantity = parseNumber(formData.get(`qty_${account.id}`));
    const manualBalance = parseNumber(formData.get(`balance_${account.id}`));
    const manualPrice = parseNumber(formData.get(`price_${account.id}`));

    const hasInput =
      (account.kind === "bank" || account.kind === "usd_investment"
        ? manualBalance != null
        : quantity != null);

    if (!hasInput) continue;

    const result = await valuateSnapshot(supabase, {
      account,
      quantity,
      manualBalance,
      manualPrice,
    });

    const { error } = await supabase.from("snapshots").upsert(
      {
        account_id: account.id,
        month,
        quantity,
        manual_balance: manualBalance,
        price_used: result.priceUsed,
        value_cop: result.valueCop,
        value_usd: result.valueUsd,
      },
      { onConflict: "account_id,month" }
    );

    if (error) throw new Error(`${account.name}: ${error.message}`);
  }

  revalidatePath(`/profiles/${profileId}/snapshots`);
  revalidatePath(`/profiles/${profileId}`);
  revalidatePath("/");
  revalidatePath("/reports");
}
