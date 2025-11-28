/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StockChart({ combinedHistory }) {
  if (!combinedHistory || combinedHistory.length === 0) return null;

  const maxLength = Math.max(...combinedHistory.map((c) => c.history.length));

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 0; i < maxLength; i++) {
      const point = { name: `#${i + 1}` };
      combinedHistory.forEach((c) => {
        point[c.symbol] = c.history[i] ?? null;
      });
      data.push(point);
    }
    return data;
  }, [combinedHistory, maxLength]);

  const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <XAxis dataKey="name" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip />
        <Legend />
        {combinedHistory.map((c, idx) => (
          <Line
            key={c.symbol}
            type="monotone"
            dataKey={c.symbol}
            stroke={colors[idx % colors.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
