"use client";

import { Send, CheckCircle, XCircle, UserX } from "lucide-react";

interface Stats {
  sent: number;
  delivered: number;
  failed: number;
  clicked?: number;
  opened?: number;
}

interface Props {
  stats: Stats;
}

export function CampaignStats({ stats }: Props) {
  const statCards = [
    {
      label: "Sent",
      value: stats.sent,
      icon: Send,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Failed",
      value: stats.failed,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Opted Out",
      value: stats.sent - stats.delivered - stats.failed,
      icon: UserX,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-warm-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-xs text-warm-500 uppercase font-medium">
                {stat.label}
              </p>
              <p className="text-2xl font-semibold text-warm-900 mt-0.5">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
