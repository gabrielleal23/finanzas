import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedPrice } from "@/lib/prices/cache";
import { fetchUsdToCopRate } from "@/lib/prices/fx";
import { fetchMetalPriceUsdPerOz } from "@/lib/prices/metals";
import { fetchStockPriceUsd } from "@/lib/prices/stocks";
import { fetchCryptoPriceUsd } from "@/lib/prices/crypto";
import type { MetalType } from "@/lib/supabase/types";

// Endpoint de solo lectura para previsualizar un precio en los formularios antes de
// guardar un snapshot (ej. "precio actual del oro" mientras el usuario captura cantidad).
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const kind = request.nextUrl.searchParams.get("kind");
  const symbol = request.nextUrl.searchParams.get("symbol") ?? "";

  try {
    if (kind === "fx") {
      const rate = await fetchUsdToCopRate();
      return NextResponse.json({ price: rate, cached: false });
    }

    if (kind === "metal") {
      const result = await getCachedPrice(supabase, `metal:${symbol}`, "metalpriceapi", () =>
        fetchMetalPriceUsdPerOz(symbol as MetalType)
      );
      return NextResponse.json(result);
    }

    if (kind === "stock") {
      const result = await getCachedPrice(supabase, `stock:${symbol}`, "fmp", () =>
        fetchStockPriceUsd(symbol)
      );
      return NextResponse.json(result);
    }

    if (kind === "crypto") {
      const result = await getCachedPrice(supabase, `crypto:${symbol}`, "coingecko", () =>
        fetchCryptoPriceUsd(symbol)
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "kind inválido" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "error desconocido" },
      { status: 502 }
    );
  }
}
