import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  setup: {
    hasVonageNumber: boolean;
    hasGreeting: boolean;
    hasBusinessHours: boolean;
    hasCustomer: boolean;
    hasSubscription: boolean;
  };
}

export function SetupChecklist({ setup }: Props) {
  const setupItems = [
    {
      id: "phone",
      label: "Connect phone number",
      completed: setup.hasVonageNumber,
      href: "/dashboard/settings/shop",
    },
    {
      id: "greeting",
      label: "Customize greeting",
      completed: setup.hasGreeting,
      href: "/dashboard/settings/shop",
    },
    {
      id: "hours",
      label: "Set business hours",
      completed: setup.hasBusinessHours,
      href: "/dashboard/settings/shop",
    },
    {
      id: "customer",
      label: "Add your first customer",
      completed: setup.hasCustomer,
      href: "/dashboard/customers",
    },
    {
      id: "subscription",
      label: "Activate subscription",
      completed: setup.hasSubscription,
      href: "/dashboard/settings/billing",
    },
  ];
  
  const completedCount = setupItems.filter((item) => item.completed).length;
  const progress = (completedCount / setupItems.length) * 100;
  
  if (completedCount === setupItems.length) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-warm-800">Get Started</h2>
            <p className="text-sm text-warm-500 mt-1">
              {completedCount} of {setupItems.length} completed
            </p>
          </div>
          <Badge variant="info">{Math.round(progress)}%</Badge>
        </div>
      </CardHeader>
      <CardBody>
        <div className="mb-4 h-2 bg-warm-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="space-y-3">
          {setupItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center justify-between p-3 rounded-md hover:bg-warm-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <CheckCircle size={20} className="text-success-500 flex-shrink-0" />
                ) : (
                  <Circle size={20} className="text-warm-300 flex-shrink-0" />
                )}
                <span
                  className={
                    item.completed ? "text-warm-500 line-through" : "text-warm-700"
                  }
                >
                  {item.label}
                </span>
              </div>
              {!item.completed && (
                <Button variant="ghost" size="sm">
                  Setup
                </Button>
              )}
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
