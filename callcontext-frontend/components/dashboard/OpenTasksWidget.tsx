import Link from "next/link";
import { CheckSquare, ArrowRight, Clock } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeDate } from "@/lib/utils/formatting";

interface Props {
  tasks: any[];
}

export function OpenTasksWidget({ tasks }: Props) {
  const displayTasks = tasks.slice(0, 5);
  const overdueCount = tasks.filter((task) => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date();
  }).length;
  
  function getPriorityColor(priority: string) {
    if (priority === "high") return "bg-error-500";
    if (priority === "medium") return "bg-warning-500";
    return "bg-info-500";
  }
  
  function isOverdue(dueDate: string | null) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }
  
  function formatDueDate(dueDate: string | null) {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays <= 7) return `${diffDays}d`;
    return formatRelativeDate(dueDate);
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-info-500" />
          <h3 className="font-semibold text-warm-800">Tasks</h3>
          {overdueCount > 0 && (
            <Badge variant="error" size="sm">
              {overdueCount} overdue
            </Badge>
          )}
        </div>
        {tasks.length > 0 && (
          <Link
            href="/dashboard/tasks"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            View all
          </Link>
        )}
      </CardHeader>
      
      <CardBody className="pt-0">
        {displayTasks.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-2">
              <CheckSquare size={18} className="text-warm-400" />
            </div>
            <p className="text-sm text-warm-500">No open tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTasks.map((task) => {
              const customerName = task.customer?.first_name || task.customer?.last_name
                ? `${task.customer.first_name ?? ""} ${task.customer.last_name ?? ""}`.trim()
                : null;
              const dueDateStr = formatDueDate(task.due_date);
              const overdue = isOverdue(task.due_date);
              
              return (
                <Link
                  key={task.id}
                  href={`/dashboard/tasks`}
                  className="block group"
                >
                  <div className="flex items-start gap-3 p-2 rounded-md hover:bg-warm-50 transition-colors">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${getPriorityColor(task.priority)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-800 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {dueDateStr && (
                          <span
                            className={`text-xs flex items-center gap-1 ${
                              overdue ? "text-error-600 font-medium" : "text-warm-500"
                            }`}
                          >
                            <Clock size={12} />
                            {dueDateStr}
                          </span>
                        )}
                        {customerName && (
                          <span className="text-xs text-warm-500">
                            • {customerName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardBody>
      
      {displayTasks.length > 0 && displayTasks.length < tasks.length && (
        <CardFooter className="pt-0">
          <Link
            href="/dashboard/tasks"
            className="flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors w-full"
          >
            View all tasks
            <ArrowRight size={14} />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
