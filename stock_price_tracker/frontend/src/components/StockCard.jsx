/* eslint-disable react/prop-types */
export default function StockCard({ symbol, price, prevPrice }) {
  const isUp = price != null && prevPrice != null ? price >= prevPrice : true;

  return (
    <div className="bg-gray-800 shadow-lg rounded-xl p-5 hover:shadow-2xl transition cursor-pointer border border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-100">{symbol}</h2>
        <span
          className={`w-3 h-3 rounded-full ${
            isUp ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>

      <p className="text-3xl font-semibold mt-3 text-gray-100">
        {price != null ? `$${price}` : "..."}
      </p>

      <p className={`mt-2 text-sm ${isUp ? "text-green-400" : "text-red-400"}`}>
        {isUp ? "Trending Up ↑" : "Trending Down ↓"}
      </p>
    </div>
  );
}
