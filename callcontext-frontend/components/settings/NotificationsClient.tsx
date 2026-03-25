"use client";

import { useState } from "react";
import { Bell, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

type NotifPref = {
  label: string;
  description: string;
  key: string;
};

const EMAIL_PREFS: NotifPref[] = [
  {
    label: "Call summaries",
    description: "Receive an email after each AI-processed call with a transcript summary.",
    key: "email_call_summary",
  },
  {
    label: "Weekly digest",
    description: "A weekly report of calls, orders, and customer activity.",
    key: "email_weekly_digest",
  },
  {
    label: "Team activity",
    description: "Get notified when teammates join or roles change.",
    key: "email_team_activity",
  },
  {
    label: "Billing alerts",
    description: "Payment receipts, failed charges, and plan changes.",
    key: "email_billing",
  },
];

const IN_APP_PREFS: NotifPref[] = [
  {
    label: "New customer detected",
    description: "When AI identifies a first-time caller.",
    key: "inapp_new_customer",
  },
  {
    label: "Reminder due",
    description: "Upcoming reminders for customers or tasks.",
    key: "inapp_reminder",
  },
  {
    label: "Order updates",
    description: "Status changes on orders tied to calls.",
    key: "inapp_order_update",
  },
];

export function NotificationsClient({
  initialPrefs,
}: {
  initialPrefs: Record<string, boolean>;
}) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggle(key: string) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/shop/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_prefs: prefs }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }
      setMessage("Notification preferences saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function Section({
    title,
    items,
  }: {
    title: string;
    items: NotifPref[];
  }) {
    return (
      <div className="space-y-4">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-warm-500">
          {title}
        </h3>
        {items.map((item) => (
          <label
            key={item.key}
            className="flex items-start gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-warm-300 text-brand-600 cursor-pointer"
              checked={prefs[item.key] ?? true}
              onChange={() => toggle(item.key)}
            />
            <div>
              <p className="text-sm font-medium text-warm-800">{item.label}</p>
              <p className="text-xs text-warm-500">{item.description}</p>
            </div>
          </label>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="text-brand-600" size={20} />
          <h2 className="font-display text-lg font-semibold text-warm-900">
            Notification preferences
          </h2>
        </div>
      </CardHeader>
      <CardBody className="space-y-8">
        <Section title="Email notifications" items={EMAIL_PREFS} />
        <Section title="In-app notifications" items={IN_APP_PREFS} />

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Save preferences
          </Button>
          {message && (
            <span className="text-sm text-warm-600">{message}</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
