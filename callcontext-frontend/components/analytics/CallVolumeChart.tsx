"use client";

import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface CallVolumeChartProps {
  data: Array<{ date: string; count: number }>;
}

export function CallVolumeChart({ data }: CallVolumeChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-warm-900">Call Volume</h3>
        <p className="text-sm text-warm-600 mt-1">
          Daily call trends over time
        </p>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={256}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="callVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
            <Tooltip
              formatter={(value: number) => [value, "Calls"]}
              labelFormatter={formatDate}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#callVolume)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
