import type { SupabaseClient } from "@supabase/supabase-js";
import type { Account, Database, MetalType } from "@/lib/supabase/types";
import { getCachedPrice } from "@/lib/prices/cache";
import { fetchUsdToCopRate } from "@/lib/prices/fx";
import { fetchMetalPriceUsdPerOz } from "@/lib/prices/metals";
import { fetchStockPriceUsd } from "@/lib/prices/stocks";
import { fetchCryptoPriceUsd } from "@/lib/prices/crypto";

const GRAMS_PER_OZ = 31.1034768;

export interface ValuationInput {
  account: Account;
  quantity: number | null;
  manualBalance: number | null;
  manualPrice: number | null;
}

export interface ValuationResult {
  priceUsed: number | null;
  valueUsd: number;
  valueCop: number;
  priceSource: "manual" | "auto" | "n/a";
}

/**
 * Calcula el valor en USD/COP de un snapshot según el tipo de cuenta.
 * - bank: usa manual_balance directamente (en la moneda de la cuenta, asumida COP salvo que
 *   la cuenta esté en USD).
 * - usd_investment: manual_balance ya está en USD.
 * - metal: quantity (g u oz) * precio spot por oz (auto o manual).
 * - other_investment: quantity * precio del símbolo (auto o manual).
 */
export async function valuateSnapshot(
  supabase: SupabaseClient<Database>,
  input: ValuationInput
): Promise<ValuationResult> {
  const { account, quantity, manualBalance, manualPrice } = input;
  const usdToCop = await fetchUsdToCopRate();

  if (account.kind === "bank") {
    const balance = manualBalance ?? 0;
    if (account.currency === "USD") {
      return { priceUsed: null, valueUsd: balance, valueCop: balance * usdToCop, priceSource: "n/a" };
    }
    return { priceUsed: null, valueUsd: balance / usdToCop, valueCop: balance, priceSource: "n/a" };
  }

  if (account.kind === "usd_investment") {
    const balance = manualBalance ?? 0;
    return { priceUsed: null, valueUsd: balance, valueCop: balance * usdToCop, priceSource: "n/a" };
  }

  if (account.kind === "metal") {
    const qty = quantity ?? 0;
    const metalType = (account.attributes.metal_type ?? "gold") as MetalType;
    const unit = account.attributes.unit ?? "oz";
    let priceUsed: number;
    let priceSource: "manual" | "auto";

    if (manualPrice != null) {
      priceUsed = manualPrice;
      priceSource = "manual";
    } else {
      const { price } = await getCachedPrice(supabase, `metal:${metalType}`, "metalpriceapi", () =>
        fetchMetalPriceUsdPerOz(metalType)
      );
      priceUsed = price;
      priceSource = "auto";
    }

    const qtyOz = unit === "g" ? qty / GRAMS_PER_OZ : qty;
    const valueUsd = qtyOz * priceUsed;
    return { priceUsed, valueUsd, valueCop: valueUsd * usdToCop, priceSource };
  }

  // other_investment
  const qty = quantity ?? 0;
  const symbol = account.attributes.symbol ?? "";
  const assetType = account.attributes.asset_type ?? "stock";
  let priceUsed: number;
  let priceSource: "manual" | "auto";

  if (manualPrice != null) {
    priceUsed = manualPrice;
    priceSource = "manual";
  } else {
    const { price } = await getCachedPrice(supabase, `${assetType}:${symbol}`, assetType, () =>
      assetType === "crypto" ? fetchCryptoPriceUsd(symbol) : fetchStockPriceUsd(symbol)
    );
    priceUsed = price;
    priceSource = "auto";
  }

  const valueUsd = qty * priceUsed;
  return { priceUsed, valueUsd, valueCop: valueUsd * usdToCop, priceSource };
}
