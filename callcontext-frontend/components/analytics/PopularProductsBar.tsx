"use client";

import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";

interface PopularProductsBarProps {
  products: Array<{ name: string; count: number }>;
  shopConfig: ShopIndustryConfig;
}

export function PopularProductsBar({
  products,
  shopConfig,
}: PopularProductsBarProps) {
  const itemLabel =
    shopConfig.service_labels?.item?.charAt(0).toUpperCase() +
      shopConfig.service_labels?.item?.slice(1) || "Product";

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-warm-900">
            Popular {itemLabel}s
          </h3>
          <p className="text-sm text-warm-600 mt-1">
            Most mentioned {itemLabel.toLowerCase()}s in calls
          </p>
        </CardHeader>
        <CardBody>
          <EmptyState
            icon={Target}
            title={`No ${itemLabel.toLowerCase()} data yet`}
            description={`${itemLabel} mentions will appear here once they're tracked in calls`}
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-warm-900">
          Popular {itemLabel}s
        </h3>
        <p className="text-sm text-warm-600 mt-1">
          Most mentioned {itemLabel.toLowerCase()}s in calls
        </p>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={products}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: "12px" }} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
              width={90}
            />
            <Tooltip
              formatter={(value: number) => [value, "Mentions"]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            />
            <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
