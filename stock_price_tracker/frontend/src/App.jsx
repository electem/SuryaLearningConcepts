import { useState } from "react";
import { useStockStore } from "./store/stockStore";
import StockCard from "./components/StockCard";
import StockChart from "./components/StockChart";
import { useStockPoller } from "./hooks/useStockPoller";

export default function App() {
  const { symbols, prices, history, addSymbol } = useStockStore();
  const [input, setInput] = useState("");

  useStockPoller(); // always top-level

  const handleAdd = () => {
    if (!input.trim()) return;
    addSymbol(input.trim());
    setInput("");
  };

  // Prepare chart data
  const combinedHistory = symbols.map((symbol) => ({
    symbol,
    history: history[symbol] || [],
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 shadow-lg px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <h1 className="text-3xl font-bold text-blue-400">
          📈 Stock Tracker Dashboard
        </h1>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add stock symbol (e.g., NFLX)"
            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-blue-400 focus:border-blue-400"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 transition rounded-lg font-semibold shadow"
          >
            Add
          </button>
        </div>
      </nav>

      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-200">
          Live Stock Prices
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {symbols.map((symbol) => {
            const hist = history[symbol] || [];
            const prev = hist.length > 1 ? hist[hist.length - 2] : hist[0];
            return (
              <StockCard
                key={symbol}
                symbol={symbol}
                price={prices[symbol]}
                prevPrice={prev}
              />
            );
          })}
        </div>

        {symbols.length > 0 && (
          <div className="mt-12 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              Stock Price Trends
            </h2>
            <StockChart combinedHistory={combinedHistory} />
          </div>
        )}
      </div>
    </div>
  );
}
