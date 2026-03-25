"use client";

import Link from "next/link";
import { Bell, ArrowRight, User, Clock } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/formatting";

interface Props {
  reminders: any[];
}

export function ReminderDashboardWidget({ reminders }: Props) {
  function formatTime(date: string): string {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const displayReminders = reminders.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-brand-500" />
          <h3 className="font-semibold text-warm-800">Today's Reminders</h3>
        </div>
        {reminders.length > 0 && (
          <Badge variant="info">{reminders.length}</Badge>
        )}
      </CardHeader>

      <CardBody className="pt-0">
        {reminders.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-2">
              <Bell size={18} className="text-warm-400" />
            </div>
            <p className="text-sm text-warm-500">No reminders today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayReminders.map((reminder) => {
              const customerName =
                reminder.customer?.first_name || reminder.customer?.last_name
                  ? `${reminder.customer.first_name ?? ""} ${reminder.customer.last_name ?? ""}`.trim()
                  : "Unknown";

              return (
                <Link
                  key={reminder.id}
                  href={`/dashboard/customers/${reminder.customer_id}`}
                  className="block group"
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md",
                      "hover:bg-warm-50 transition-colors"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                      <User size={14} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-800 truncate group-hover:text-brand-600 transition-colors">
                        {customerName}
                      </p>
                      <p className="text-xs text-warm-600 truncate">
                        {reminder.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-warm-500 shrink-0">
                      <Clock size={12} />
                      {formatTime(reminder.reminder_date)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardBody>

      {reminders.length > 0 && (
        <CardFooter className="pt-0">
          <Link
            href="/dashboard/reminders"
            className="flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors w-full"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
