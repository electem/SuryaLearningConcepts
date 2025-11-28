import { useEffect, useCallback } from "react";
import { fetchPrices } from "../utils/api";
import { useStockStore } from "../store/stockStore";

export const useStockPoller = () => {
  const symbols = useStockStore((s) => s.symbols);
  const setPrices = useStockStore((s) => s.setPrices);

  const getPrices = useCallback(async () => {
    if (!symbols || symbols.length === 0) return;
    try {
      const data = await fetchPrices(symbols); // { results: [{symbol, price}] }
      const priceObj = {};
      data.results.forEach((item) => {
        priceObj[item.symbol] = item.price;
      });
      setPrices(priceObj);
    } catch (err) {
      console.error("Error fetching prices:", err);
    }
  }, [symbols, setPrices]);

  useEffect(() => {
    getPrices(); // initial call
    const interval = setInterval(getPrices, 5000);
    return () => clearInterval(interval);
  }, [getPrices]);
};
