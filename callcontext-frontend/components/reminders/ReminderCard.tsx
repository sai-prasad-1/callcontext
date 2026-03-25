"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  Sparkles,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/formatting";
import { CreateReminderModal } from "./CreateReminderModal";

interface Props {
  reminder: any;
  onUpdate: () => void;
  variant?: "default" | "overdue";
}

export function ReminderCard({ reminder, onUpdate, variant = "default" }: Props) {
  const [showActions, setShowActions] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const snoozeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
      if (
        snoozeRef.current &&
        !snoozeRef.current.contains(event.target as Node)
      ) {
        setShowSnooze(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleAction(action: string, days?: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/reminders/${reminder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, days }),
      });

      if (res.ok) {
        onUpdate();
        setShowActions(false);
        setShowSnooze(false);
      }
    } catch (error) {
      console.error("Failed to update reminder:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this reminder?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/reminders/${reminder.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string): string {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }

  function detectRecurringPattern(reminder: any): string | null {
    if (!reminder.recurring_pattern) return null;
    return reminder.recurring_pattern;
  }

  const customerName =
    reminder.customer?.first_name || reminder.customer?.last_name
      ? `${reminder.customer.first_name ?? ""} ${reminder.customer.last_name ?? ""}`.trim()
      : "Unknown Customer";

  const recurringPattern = detectRecurringPattern(reminder);

  return (
    <>
      <Card
        className={cn(
          "transition-all duration-150",
          variant === "overdue" && "border-l-4 border-l-danger-500 bg-danger-50/20"
        )}
      >
        <CardBody>
          <div className="flex items-center gap-4">
            {/* Left: Date Icon */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className={cn(
                  "w-12 h-12 rounded-lg flex flex-col items-center justify-center",
                  variant === "overdue"
                    ? "bg-danger-100 text-danger-700"
                    : "bg-brand-50 text-brand-600"
                )}
              >
                <Calendar size={20} />
              </div>
              <div className="text-sm">
                <div className="font-medium text-warm-700">
                  {formatDate(reminder.reminder_date)}
                </div>
                {reminder.advance_days > 0 && (
                  <div className="text-xs text-warm-500 flex items-center gap-1">
                    <Clock size={12} />
                    {reminder.advance_days}d notice
                  </div>
                )}
              </div>
            </div>

            {/* Center: Customer + Title + Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-warm-400 shrink-0" />
                <Link
                  href={`/dashboard/customers/${reminder.customer_id}`}
                  className="text-sm text-brand-600 hover:text-brand-700 hover:underline truncate"
                >
                  {customerName}
                </Link>
              </div>
              <h3 className="font-semibold text-warm-800 truncate">
                {reminder.title}
              </h3>
              {reminder.description && (
                <p className="text-sm text-warm-600 mt-1 truncate">
                  {reminder.description}
                </p>
              )}
            </div>

            {/* Right: Badges + Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {recurringPattern && (
                <Badge variant="info" className="flex items-center gap-1">
                  <Sparkles size={12} />
                  {recurringPattern}
                </Badge>
              )}

              {/* Actions Dropdown */}
              <div className="relative" ref={actionsRef}>
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 text-warm-400 hover:text-warm-600 hover:bg-warm-100 rounded-md transition-colors"
                  disabled={loading}
                >
                  <MoreHorizontal size={18} />
                </button>

                {showActions && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-warm-200 py-1 z-10">
                    {/* Snooze */}
                    <div className="relative" ref={snoozeRef}>
                      <button
                        onClick={() => setShowSnooze(!showSnooze)}
                        className="w-full px-4 py-2 text-left text-sm text-warm-700 hover:bg-warm-50 flex items-center gap-2"
                      >
                        <Clock size={14} />
                        Snooze
                      </button>
                      {showSnooze && (
                        <div className="absolute left-full top-0 ml-1 w-36 bg-white rounded-lg shadow-lg border border-warm-200 py-1">
                          <button
                            onClick={() => handleAction("snooze", 1)}
                            className="w-full px-4 py-2 text-left text-sm text-warm-700 hover:bg-warm-50"
                          >
                            1 day
                          </button>
                          <button
                            onClick={() => handleAction("snooze", 3)}
                            className="w-full px-4 py-2 text-left text-sm text-warm-700 hover:bg-warm-50"
                          >
                            3 days
                          </button>
                          <button
                            onClick={() => handleAction("snooze", 7)}
                            className="w-full px-4 py-2 text-left text-sm text-warm-700 hover:bg-warm-50"
                          >
                            1 week
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={() => handleAction("dismiss")}
                      className="w-full px-4 py-2 text-left text-sm text-warm-700 hover:bg-warm-50 flex items-center gap-2"
                    >
                      <X size={14} />
                      Dismiss
                    </button>

                    {/* Complete */}
                    <button
                      onClick={() => handleAction("complete")}
                      className="w-full px-4 py-2 text-left text-sm text-success-700 hover:bg-success-50 flex items-center gap-2"
                    >
                      <Check size={14} />
                      Complete
                    </button>

                    <div className="border-t border-warm-150 my-1" />

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditModalOpen(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-warm-700 hover:bg-warm-50 flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-danger-700 hover:bg-danger-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Edit Modal */}
      {editModalOpen && (
        <CreateReminderModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onCreate={onUpdate}
          customers={[]}
          existingReminder={reminder}
        />
      )}
    </>
  );
}
