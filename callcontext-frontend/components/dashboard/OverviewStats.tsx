import { Phone, UserPlus, PhoneMissed, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

interface Props {
  stats: {
    calls_today: number;
    new_customers_today: number;
    missed_calls_today: number;
    follow_ups_pending: number;
    calls_this_week: number;
    calls_last_week: number;
  };
}

export function OverviewStats({ stats }: Props) {
  const callsChange = stats.calls_last_week > 0
    ? ((stats.calls_this_week - stats.calls_last_week) / stats.calls_last_week) * 100
    : stats.calls_this_week > 0 ? 100 : 0;
  
  const statCards = [
    {
      label: "Calls Today",
      value: stats.calls_today,
      icon: Phone,
      color: "text-brand-500",
      bgColor: "bg-brand-50",
      change: callsChange,
      showChange: true,
    },
    {
      label: "New Customers",
      value: stats.new_customers_today,
      icon: UserPlus,
      color: "text-accent-500",
      bgColor: "bg-accent-50",
      showChange: false,
    },
    {
      label: "Missed Calls",
      value: stats.missed_calls_today,
      icon: PhoneMissed,
      color: stats.missed_calls_today > 0 ? "text-error-500" : "text-warm-400",
      bgColor: stats.missed_calls_today > 0 ? "bg-error-50" : "bg-warm-50",
      showChange: false,
    },
    {
      label: "Follow-ups",
      value: stats.follow_ups_pending,
      icon: AlertCircle,
      color: stats.follow_ups_pending > 0 ? "text-warning-500" : "text-warm-400",
      bgColor: stats.follow_ups_pending > 0 ? "bg-warning-50" : "bg-warm-50",
      showChange: false,
    },
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.label} variant="stat">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-warm-500">{stat.label}</p>
                <p className="text-3xl font-display font-semibold text-warm-800 mt-1">
                  {stat.value}
                </p>
                {stat.showChange && (
                  <div className="flex items-center gap-1 mt-2">
                    {stat.change >= 0 ? (
                      <TrendingUp size={14} className="text-success-600" />
                    ) : (
                      <TrendingDown size={14} className="text-error-600" />
                    )}
                    <p
                      className={`text-xs font-medium ${
                        stat.change >= 0 ? "text-success-600" : "text-error-600"
                      }`}
                    >
                      {stat.change >= 0 ? "+" : ""}
                      {stat.change.toFixed(0)}% from last week
                    </p>
                  </div>
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center shrink-0`}
              >
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
