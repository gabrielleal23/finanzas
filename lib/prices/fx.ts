/** Tipo de cambio USD -> COP, sin API key (open.er-api.com). */
export async function fetchUsdToCopRate(): Promise<number> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`FX API error: ${res.status}`);
  const json = await res.json();
  const rate = json?.rates?.COP;
  if (typeof rate !== "number") throw new Error("FX API: COP rate not found");
  return rate;
}
