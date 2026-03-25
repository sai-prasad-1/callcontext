"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { OverviewCards } from "./OverviewCards";
import { CallVolumeChart } from "./CallVolumeChart";
import { SentimentDonut } from "./SentimentDonut";
import { BusiestHoursHeatmap } from "./BusiestHoursHeatmap";
import { TopCustomersTable } from "./TopCustomersTable";
import { PopularProductsBar } from "./PopularProductsBar";
import { CustomerGrowthChart } from "./CustomerGrowthChart";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";
import { Skeleton } from "@/components/ui/Skeleton";

type Period = 7 | 30 | 90;

interface AnalyticsClientProps {
  initialData: any;
  shopConfig: ShopIndustryConfig;
}

export function AnalyticsClient({
  initialData,
  shopConfig,
}: AnalyticsClientProps) {
  const [period, setPeriod] = useState<Period>(30);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = async (newPeriod: Period) => {
    setPeriod(newPeriod);
    setLoading(true);

    try {
      const [overview, callVolume, sentiment, insights] = await Promise.all([
        fetch(`/api/analytics/overview?days=${newPeriod}`).then((res) =>
          res.json()
        ),
        fetch(`/api/analytics/call-volume?days=${newPeriod}`).then((res) =>
          res.json()
        ),
        fetch(`/api/analytics/sentiment?days=${newPeriod}`).then((res) =>
          res.json()
        ),
        fetch(`/api/analytics/insights?days=${newPeriod}`).then((res) =>
          res.json()
        ),
      ]);

      setData({ overview, callVolume, sentiment, insights });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-warm-900">Analytics</h1>
          <p className="text-sm text-warm-600 mt-1">
            Track your business performance and insights
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={period === 7 ? "primary" : "secondary"}
            size="sm"
            onClick={() => handlePeriodChange(7)}
            disabled={loading}
          >
            7 days
          </Button>
          <Button
            variant={period === 30 ? "primary" : "secondary"}
            size="sm"
            onClick={() => handlePeriodChange(30)}
            disabled={loading}
          >
            30 days
          </Button>
          <Button
            variant={period === 90 ? "primary" : "secondary"}
            size="sm"
            onClick={() => handlePeriodChange(90)}
            disabled={loading}
          >
            90 days
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          {data?.overview && <OverviewCards data={data.overview} />}

          {data?.callVolume && data?.sentiment && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CallVolumeChart data={data.callVolume} />
              </div>
              <div>
                <SentimentDonut data={data.sentiment} />
              </div>
            </div>
          )}

          {data?.insights?.busiestHours && (
            <BusiestHoursHeatmap data={data.insights.busiestHours} />
          )}

          {data?.insights?.topCustomers && data?.insights?.popularProducts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopCustomersTable customers={data.insights.topCustomers} />
              <PopularProductsBar
                products={data.insights.popularProducts}
                shopConfig={shopConfig}
              />
            </div>
          )}

          {data?.insights?.customerGrowth && (
            <CustomerGrowthChart data={data.insights.customerGrowth} />
          )}
        </>
      )}
    </div>
  );
}
