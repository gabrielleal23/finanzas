import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns today's cached price for `symbol` if present, otherwise calls `fetchFresh`,
 * stores the result, and returns it. Falls back to the most recent cached price (any
 * date) if `fetchFresh` throws — keeps reports usable when a free-tier API is rate-limited.
 */
export async function getCachedPrice(
  supabase: SupabaseClient<Database>,
  symbol: string,
  source: string,
  fetchFresh: () => Promise<number>
): Promise<{ price: number; cached: boolean; priceDate: string }> {
  const date = today();

  const { data: existing } = await supabase
    .from("price_cache")
    .select("price_usd, price_date")
    .eq("symbol", symbol)
    .eq("price_date", date)
    .maybeSingle();

  if (existing) {
    return { price: Number(existing.price_usd), cached: true, priceDate: existing.price_date };
  }

  try {
    const price = await fetchFresh();
    await supabase
      .from("price_cache")
      .upsert({ symbol, price_date: date, price_usd: price, source }, { onConflict: "symbol,price_date" });
    return { price, cached: false, priceDate: date };
  } catch (err) {
    const { data: latest } = await supabase
      .from("price_cache")
      .select("price_usd, price_date")
      .eq("symbol", symbol)
      .order("price_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      return { price: Number(latest.price_usd), cached: true, priceDate: latest.price_date };
    }
    throw err;
  }
}
