/**
 * Precio en USD para acciones/fondos por símbolo (ej. "AAPL"). Requiere FMP_API_KEY
 * (financialmodelingprep.com, free tier). Si la key no está configurada, lanza para
 * que el caller caiga a modo manual.
 */
export async function fetchStockPriceUsd(symbol: string): Promise<number> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) throw new Error("FMP_API_KEY no configurada");

  const res = await fetch(
    `https://financialmodelingprep.com/api/v3/quote-short/${encodeURIComponent(symbol)}?apikey=${apiKey}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`Stocks API error: ${res.status}`);
  const json = await res.json();
  const price = json?.[0]?.price;
  if (typeof price !== "number") throw new Error(`Stocks API: precio no encontrado para ${symbol}`);
  return price;
}
