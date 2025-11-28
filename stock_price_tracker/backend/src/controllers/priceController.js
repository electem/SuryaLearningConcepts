// src/controllers/priceController.js
import { getPricesForSymbols } from "../services/priceService.js";

export async function getPrices(req, res, next) {
  try {
    const symbolsQuery = req.query.symbols;
    if (!symbolsQuery) return res.status(400).json({ error: "symbols param missing" });

    const symbols = symbolsQuery.split(",").map(s => s.trim().toUpperCase());
    const results = await getPricesForSymbols(symbols);

    res.json({ timestamp: new Date().toISOString(), results });
  } catch (err) {
    next(err);
  }
}
