"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/formatting";

interface TaskCardProps {
  task: any;
  draggableProps?: any;
  dragHandleProps?: any;
  isDragging?: boolean;
  onUpdate: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PRIORITY_COLORS = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-gray-400",
} as const;

function formatDueDate(dueDateStr: string | null): {
  text: string;
  icon: typeof Clock | typeof Calendar | typeof AlertCircle;
  color: string;
  isOverdue: boolean;
} | null {
  if (!dueDateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`,
      icon: AlertCircle,
      color: "text-red-600",
      isOverdue: true,
    };
  } else if (diffDays === 0) {
    return {
      text: "Today",
      icon: Clock,
      color: "text-yellow-600",
      isOverdue: false,
    };
  } else if (diffDays === 1) {
    return {
      text: "Tomorrow",
      icon: Calendar,
      color: "text-warm-600",
      isOverdue: false,
    };
  } else {
    return {
      text: `in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
      icon: Calendar,
      color: "text-warm-600",
      isOverdue: false,
    };
  }
}

export function TaskCard({
  task,
  draggableProps,
  dragHandleProps,
  isDragging = false,
  onUpdate,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const dueDateInfo = formatDueDate(task.due_date);
  const customer = task.customer;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onUpdate();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete task");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <div {...draggableProps}>
      <Card
        variant="hover"
        className={cn(
          "transition-all duration-150 relative cursor-pointer",
          isDragging && "opacity-50 shadow-xl"
        )}
      >
        <CardBody className="p-4">
          {/* Priority Bar */}
          <div
            className={cn(
              "absolute left-0 top-0 w-1 h-full rounded-l-lg",
              PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
            )}
          />

          {/* Drag Handle (desktop only) */}
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="absolute left-1 top-4 text-warm-300 hover:text-warm-500 cursor-grab active:cursor-grabbing hidden md:block"
            >
              <GripVertical size={16} />
            </div>
          )}

          <div className={cn("space-y-3", dragHandleProps && "md:pl-5")}>
            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-2">
              <h3
                className="font-semibold text-warm-800 text-sm line-clamp-2 flex-1"
                onClick={onEdit}
              >
                {task.title}
              </h3>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="text-warm-400 hover:text-warm-600 p-1 rounded transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-warm-150 py-1 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onEdit?.();
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-warm-700 hover:bg-warm-50 flex items-center gap-2"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        disabled={isDeleting}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-warm-600 line-clamp-1">
                {task.description}
              </p>
            )}

            {/* Customer */}
            {customer && (
              <Link
                href={`/dashboard/customers/${customer.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 hover:bg-warm-50 -mx-2 px-2 py-1 rounded transition-colors"
              >
                <Avatar
                  firstName={customer.first_name}
                  lastName={customer.last_name}
                  size="sm"
                />
                <span className="text-sm text-warm-700 truncate">
                  {customer.first_name || customer.last_name
                    ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
                    : customer.phone}
                </span>
              </Link>
            )}

            {/* Due Date */}
            {dueDateInfo && (
              <div className={cn("flex items-center gap-1.5 text-xs", dueDateInfo.color)}>
                <dueDateInfo.icon size={14} />
                <span className="font-medium">{dueDateInfo.text}</span>
              </div>
            )}

            {/* Bottom Row: Priority Badge (if high) */}
            {task.priority === "high" && (
              <div className="flex items-center justify-between pt-2 border-t border-warm-100">
                <Badge variant="danger" size="sm">
                  High Priority
                </Badge>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
