"use client";

import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SentimentDonutProps {
  data: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const COLORS = {
  positive: "#10B981",
  neutral: "#F59E0B",
  negative: "#EF4444",
};

export function SentimentDonut({ data }: SentimentDonutProps) {
  const chartData = [
    { name: "Positive", value: data.positive, color: COLORS.positive },
    { name: "Neutral", value: data.neutral, color: COLORS.neutral },
    { name: "Negative", value: data.negative, color: COLORS.negative },
  ].filter((item) => item.value > 0);

  const total = data.positive + data.neutral + data.negative;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-warm-900">Call Sentiment</h3>
        <p className="text-sm text-warm-600 mt-1">
          Customer sentiment analysis
        </p>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={256}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                "",
              ]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm text-warm-700">
                  {value}: {entry.payload.value}
                </span>
              )}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-semibold"
              fill="#1F2937"
            >
              {total}
            </text>
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs"
              fill="#6B7280"
            >
              Total Calls
            </text>
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
