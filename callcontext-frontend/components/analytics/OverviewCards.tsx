"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Phone, Users, BarChart3, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface OverviewCardsProps {
  data: {
    current: {
      totalCalls: number;
      newCustomers: number;
      answerRate: number;
      avgDuration: number;
    };
    previous: {
      totalCalls: number;
      newCustomers: number;
      answerRate: number;
      avgDuration: number;
    };
    changes: {
      totalCalls: number;
      newCustomers: number;
      answerRate: number;
      avgDuration: number;
    };
  };
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change: number;
  suffix?: string;
}

function StatCard({ icon: Icon, label, value, change, suffix }: StatCardProps) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 rounded-lg">
              <Icon className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm text-warm-600">{label}</p>
              <p className="text-3xl font-display font-semibold text-warm-900 mt-1">
                {value}
                {suffix && (
                  <span className="text-lg text-warm-600 ml-1">{suffix}</span>
                )}
              </p>
            </div>
          </div>
          <Badge
            variant={isPositive ? "success" : "danger"}
            className="flex items-center gap-1"
          >
            <TrendIcon className="w-3 h-3" />
            {Math.abs(change).toFixed(1)}%
          </Badge>
        </div>
      </CardBody>
    </Card>
  );
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={Phone}
        label="Total Calls"
        value={data.current.totalCalls}
        change={data.changes.totalCalls}
      />
      <StatCard
        icon={Users}
        label="New Customers"
        value={data.current.newCustomers}
        change={data.changes.newCustomers}
      />
      <StatCard
        icon={BarChart3}
        label="Answer Rate"
        value={data.current.answerRate}
        change={data.changes.answerRate}
        suffix="%"
      />
      <StatCard
        icon={Clock}
        label="Avg Duration"
        value={formatDuration(data.current.avgDuration)}
        change={data.changes.avgDuration}
      />
    </div>
  );
}
