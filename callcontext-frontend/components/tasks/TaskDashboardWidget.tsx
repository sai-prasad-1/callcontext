"use client";

import Link from "next/link";
import { CheckSquare, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/formatting";

interface TaskDashboardWidgetProps {
  tasks: any[];
}

const PRIORITY_COLORS = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-gray-400",
} as const;

function isOverdue(dueDateStr: string | null): boolean {
  if (!dueDateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

function isToday(dueDateStr: string | null): boolean {
  if (!dueDateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate.getTime() === today.getTime();
}

export function TaskDashboardWidget({ tasks }: TaskDashboardWidgetProps) {
  const activeTasks = tasks.filter((t) => t.status !== "done");
  const overdueTasks = activeTasks.filter((t) => isOverdue(t.due_date));
  const todayTasks = activeTasks.filter((t) => isToday(t.due_date));
  
  const urgentTasks = [...overdueTasks, ...todayTasks]
    .sort((a, b) => {
      const aOverdue = isOverdue(a.due_date);
      const bOverdue = isOverdue(b.due_date);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      return (
        priorityWeights[b.priority as keyof typeof priorityWeights] -
        priorityWeights[a.priority as keyof typeof priorityWeights]
      );
    })
    .slice(0, 5);

  return (
    <Card>
      <CardBody className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-brand-500" />
            <h3 className="font-semibold text-warm-800">Tasks</h3>
          </div>
          <div className="flex items-center gap-2">
            {overdueTasks.length > 0 && (
              <Badge variant="danger" size="sm">
                {overdueTasks.length} overdue
              </Badge>
            )}
            {todayTasks.length > 0 && (
              <Badge variant="warning" size="sm">
                {todayTasks.length} today
              </Badge>
            )}
          </div>
        </div>

        {/* Task List */}
        {urgentTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <CheckSquare size={24} className="text-green-500" />
            </div>
            <p className="text-sm text-warm-500">No tasks due today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {urgentTasks.map((task) => {
              const taskIsOverdue = isOverdue(task.due_date);
              const taskIsToday = isToday(task.due_date);
              const customer = task.customer;

              return (
                <Link
                  key={task.id}
                  href="/dashboard/tasks"
                  className="block group"
                >
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-warm-50 transition-colors">
                    {/* Priority Dot */}
                    <div className="pt-1.5">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full block",
                          PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-warm-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {customer && (
                          <div className="flex items-center gap-1.5">
                            <Avatar
                              firstName={customer.first_name}
                              lastName={customer.last_name}
                              size="xs"
                            />
                            <span className="text-xs text-warm-600 truncate max-w-[120px]">
                              {customer.first_name || customer.last_name
                                ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
                                : customer.phone}
                            </span>
                          </div>
                        )}
                        {taskIsOverdue && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle size={12} />
                            <span className="text-xs font-medium">Overdue</span>
                          </div>
                        )}
                        {taskIsToday && !taskIsOverdue && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Clock size={12} />
                            <span className="text-xs font-medium">Today</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <Link
          href="/dashboard/tasks"
          className="flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors pt-2 border-t border-warm-100"
        >
          View all tasks
          <ArrowRight size={14} />
        </Link>
      </CardBody>
    </Card>
  );
}
