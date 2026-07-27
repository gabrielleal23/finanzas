import type { MetalType } from "@/lib/supabase/types";

const METAL_CODE: Record<MetalType, string> = {
  gold: "XAU",
  silver: "XAG",
  platinum: "XPT",
};

/**
 * Precio spot en USD por onza troy. Requiere METALPRICE_API_KEY (metalpriceapi.com,
 * free tier). Si la key no está configurada, lanza para que el caller caiga a modo manual.
 */
export async function fetchMetalPriceUsdPerOz(metal: MetalType): Promise<number> {
  const apiKey = process.env.METALPRICE_API_KEY;
  if (!apiKey) throw new Error("METALPRICE_API_KEY no configurada");

  const code = METAL_CODE[metal];
  const res = await fetch(
    `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=${code}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`Metals API error: ${res.status}`);
  const json = await res.json();
  const rate = json?.rates?.[code];
  if (typeof rate !== "number" || rate <= 0) throw new Error("Metals API: precio no encontrado");
  // `rate` es cuántas onzas equivalen a 1 USD -> precio por onza = 1 / rate
  return 1 / rate;
}
