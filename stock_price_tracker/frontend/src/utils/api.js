export const API_BASE = "http://localhost:4000/api";

export const fetchPrices = async (symbols) => {
  const res = await fetch(`${API_BASE}/prices?symbols=${symbols.join(",")}`);
  return res.json();
};
