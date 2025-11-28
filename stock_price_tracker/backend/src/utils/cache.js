const cache = {};
const TTL = 10000; // 10 seconds

export const setCache = (key, value) => {
  cache[key] = { value, expiry: Date.now() + TTL };
};

export const getCache = (key) => {
  const data = cache[key];
  if (!data) return null;
  if (Date.now() > data.expiry) return null;
  return data.value;
};
