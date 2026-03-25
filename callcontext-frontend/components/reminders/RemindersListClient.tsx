"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ReminderCard } from "./ReminderCard";
import { CreateReminderModal } from "./CreateReminderModal";

interface ReminderGroup {
  overdue: any[];
  today: any[];
  this_week: any[];
  upcoming: any[];
}

interface Props {
  initialData: ReminderGroup;
  userId: string;
}

export function RemindersListClient({ initialData, userId }: Props) {
  const [reminders, setReminders] = useState<ReminderGroup>(initialData);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState({
    overdue: false,
    today: false,
    this_week: false,
    upcoming: false,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  }

  async function fetchReminders() {
    setLoading(true);
    try {
      const res = await fetch("/api/reminders/upcoming?days=30");
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleGroup(group: keyof typeof collapsed) {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));
  }

  const hasAnyReminders =
    reminders.overdue.length > 0 ||
    reminders.today.length > 0 ||
    reminders.this_week.length > 0 ||
    reminders.upcoming.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-warm-800">
            Reminders
          </h1>
          <p className="text-warm-500 mt-1">
            Stay on top of important customer dates and follow-ups.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setModalOpen(true)}
        >
          Add reminder
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-md bg-warm-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-warm-200 rounded w-1/3" />
                    <div className="h-3 bg-warm-150 rounded w-2/3" />
                  </div>
                  <div className="h-8 bg-warm-150 rounded w-20" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasAnyReminders && (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center mb-4">
                <Plus size={24} className="text-warm-400" />
              </div>
              <h3 className="text-lg font-semibold text-warm-700">
                No reminders yet
              </h3>
              <p className="text-sm text-warm-500 mt-1 max-w-sm">
                Create reminders for important customer dates, anniversaries,
                and follow-ups.
              </p>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setModalOpen(true)}
                className="mt-4"
              >
                Create your first reminder
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Reminder Groups */}
      {!loading && hasAnyReminders && (
        <div className="space-y-4">
          {/* Overdue */}
          {reminders.overdue.length > 0 && (
            <div>
              <button
                onClick={() => toggleGroup("overdue")}
                className="flex items-center gap-2 mb-2 text-warm-800 hover:text-warm-900 transition-colors"
              >
                {collapsed.overdue ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
                <h2 className="text-lg font-semibold">Overdue</h2>
                <Badge variant="danger">{reminders.overdue.length}</Badge>
              </button>
              {!collapsed.overdue && (
                <div className="space-y-2">
                  {reminders.overdue.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onUpdate={fetchReminders}
                      variant="overdue"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Today */}
          {reminders.today.length > 0 && (
            <div>
              <button
                onClick={() => toggleGroup("today")}
                className="flex items-center gap-2 mb-2 text-warm-800 hover:text-warm-900 transition-colors"
              >
                {collapsed.today ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
                <h2 className="text-lg font-semibold">Today</h2>
                <Badge variant="info">{reminders.today.length}</Badge>
              </button>
              {!collapsed.today && (
                <div className="space-y-2">
                  {reminders.today.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onUpdate={fetchReminders}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* This Week */}
          {reminders.this_week.length > 0 && (
            <div>
              <button
                onClick={() => toggleGroup("this_week")}
                className="flex items-center gap-2 mb-2 text-warm-800 hover:text-warm-900 transition-colors"
              >
                {collapsed.this_week ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
                <h2 className="text-lg font-semibold">This Week</h2>
                <Badge variant="neutral">{reminders.this_week.length}</Badge>
              </button>
              {!collapsed.this_week && (
                <div className="space-y-2">
                  {reminders.this_week.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onUpdate={fetchReminders}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming */}
          {reminders.upcoming.length > 0 && (
            <div>
              <button
                onClick={() => toggleGroup("upcoming")}
                className="flex items-center gap-2 mb-2 text-warm-800 hover:text-warm-900 transition-colors"
              >
                {collapsed.upcoming ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
                <h2 className="text-lg font-semibold">Upcoming</h2>
                <Badge variant="neutral">{reminders.upcoming.length}</Badge>
              </button>
              {!collapsed.upcoming && (
                <div className="space-y-2">
                  {reminders.upcoming.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onUpdate={fetchReminders}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <CreateReminderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={fetchReminders}
        customers={customers}
      />
    </div>
  );
}
