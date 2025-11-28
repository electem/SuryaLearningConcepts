// src/services/priceService.js
import YahooFinance from "yahoo-finance2";
import PriceSnapshot from "../../models/PriceSnapshot.js";
import { getCache, setCache } from "../utils/cache.js";

// Create instance once
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function getPricesForSymbols(symbols = []) {
  const results = [];

  for (const s of symbols) {
    const ticker = s.trim().toUpperCase();
    const cacheKey = `yf:${ticker}`;

    const cached = getCache(cacheKey);
    if (cached != null) {
      results.push({ symbol: ticker, price: cached });
      continue;
    }

    try {
      // ✅ Call quote via instance
      const quote = await yf.quote(ticker);
      const price = quote?.regularMarketPrice ?? null;

      if (price === null) {
        results.push({ symbol: ticker, price: null, error: "No data" });
        continue;
      }

      results.push({ symbol: ticker, price });

      // Optional: save snapshot
      await PriceSnapshot.create({ symbol: ticker, price, timestamp: new Date() });

      setCache(cacheKey, price);

    } catch (err) {
      console.error("Yahoo‑finance2 error for", ticker, err.message);
      results.push({ symbol: ticker, price: null, error: err.message });
    }
  }

  return results;
}
