/**
 * Precio en USD para cripto por id de CoinGecko (ej. "bitcoin", "ethereum"). API pública,
 * sin key. `symbol` debe ser el id de CoinGecko, no el ticker.
 */
export async function fetchCryptoPriceUsd(coingeckoId: string): Promise<number> {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coingeckoId)}&vs_currencies=usd`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`Crypto API error: ${res.status}`);
  const json = await res.json();
  const price = json?.[coingeckoId]?.usd;
  if (typeof price !== "number") throw new Error(`Crypto API: precio no encontrado para ${coingeckoId}`);
  return price;
}
