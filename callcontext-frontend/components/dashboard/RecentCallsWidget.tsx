import Link from "next/link";
import { Phone, ArrowRight, User } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { formatDuration } from "@/lib/utils/formatting";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";

interface Props {
  calls: any[];
  shopConfig: ShopIndustryConfig;
}

export function RecentCallsWidget({ calls, shopConfig }: Props) {
  const displayCalls = calls.slice(0, 5);
  
  function getSentimentColor(sentiment: string | null) {
    if (sentiment === "positive") return "bg-success-500";
    if (sentiment === "negative") return "bg-error-500";
    return "bg-warm-300";
  }
  
  function getCustomerDisplay(call: any) {
    if (call.customer?.first_name || call.customer?.last_name) {
      return `${call.customer.first_name ?? ""} ${call.customer.last_name ?? ""}`.trim();
    }
    return call.customer?.phone || "Unknown";
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Phone size={18} className="text-brand-500" />
          <h3 className="font-semibold text-warm-800">Recent Calls</h3>
        </div>
        {calls.length > 0 && (
          <Link
            href="/dashboard/calls"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            View all
          </Link>
        )}
      </CardHeader>
      
      <CardBody className="pt-0">
        {displayCalls.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-2">
              <Phone size={18} className="text-warm-400" />
            </div>
            <p className="text-sm text-warm-500">No calls yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayCalls.map((call) => (
              <Link
                key={call.id}
                href={`/dashboard/calls/${call.id}`}
                className="block group"
              >
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-warm-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <User size={14} className="text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-warm-800 group-hover:text-brand-600 transition-colors">
                        {getCustomerDisplay(call)}
                      </p>
                      {call.duration_seconds && (
                        <span className="text-xs text-warm-500">
                          {formatDuration(call.duration_seconds)}
                        </span>
                      )}
                    </div>
                    {call.ai_summary && (
                      <p className="text-xs text-warm-600 truncate mt-0.5">
                        {call.ai_summary}
                      </p>
                    )}
                  </div>
                  {call.sentiment && (
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${getSentimentColor(call.sentiment)}`}
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardBody>
      
      {displayCalls.length > 0 && displayCalls.length < calls.length && (
        <CardFooter className="pt-0">
          <Link
            href="/dashboard/calls"
            className="flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors w-full"
          >
            View all calls
            <ArrowRight size={14} />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
