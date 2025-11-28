import { create } from "zustand";

export const useStockStore = create((set) => ({
  symbols: ["AAPL", "MSFT", "GOOG", "NFLX", "TSLA"],
  prices: {},       // latest price per symbol
  history: {},      // array of historical prices per symbol

  setPrices: (newPrices) =>
    set((state) => {
      const newHistory = { ...state.history };
      Object.keys(newPrices).forEach((sym) => {
        if (!newHistory[sym]) newHistory[sym] = [];
        newHistory[sym].push(newPrices[sym]); // append new price
        if (newHistory[sym].length > 20) newHistory[sym].shift(); // keep last 20
      });
      return { prices: newPrices, history: newHistory };
    }),

  addSymbol: (symbol) =>
    set((state) => {
      const upper = symbol.toUpperCase();
      if (!state.symbols.includes(upper)) {
        return { symbols: [...state.symbols, upper] };
      }
      return {};
    }),
}));
