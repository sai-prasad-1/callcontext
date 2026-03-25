"use client";

import { useState } from "react";
import {
  Zap,
  Clock,
  MessageSquare,
  Mail,
  CheckSquare,
  Bell,
  User,
  TrendingUp,
  Edit,
  History,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AutomationHistoryModal } from "./AutomationHistoryModal";
import { EditTemplateModal } from "./EditTemplateModal";

interface Props {
  rule: {
    id: string;
    name: string;
    description: string;
    trigger: string;
    delay_hours: number;
    action_type: string;
    default_enabled: boolean;
    template: string;
    enabled: boolean;
    stats: {
      pending: number;
      completed: number;
      failed: number;
    };
  };
  onUpdate: () => void;
}

const ACTION_TYPE_ICONS = {
  send_sms: MessageSquare,
  send_email: Mail,
  create_task: CheckSquare,
  create_reminder: Bell,
  update_customer: User,
};

const TRIGGER_LABELS: Record<string, string> = {
  customer_created: "New customer",
  order_delivered: "Order delivered",
  customer_birthday: "Customer birthday",
  customer_inactive_90d: "90 days inactive",
  call_positive_sentiment: "Positive call",
  call_followup_needed: "Follow-up needed",
};

export function AutomationCard({ rule, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/automations/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !rule.enabled }),
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to toggle automation:", error);
    } finally {
      setLoading(false);
    }
  }

  const ActionIcon = ACTION_TYPE_ICONS[rule.action_type as keyof typeof ACTION_TYPE_ICONS] || Zap;
  const triggerLabel = TRIGGER_LABELS[rule.trigger] || rule.trigger;

  return (
    <>
      <Card className="transition-all duration-150 hover:shadow-md">
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    rule.enabled
                      ? "bg-gradient-to-br from-brand-500 to-accent-500 text-white"
                      : "bg-warm-100 text-warm-400"
                  }`}
                >
                  <ActionIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-warm-800">{rule.name}</h3>
                  <p className="text-sm text-warm-600 mt-1">{rule.description}</p>
                </div>
              </div>

              <button
                onClick={handleToggle}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  rule.enabled ? "bg-brand-600" : "bg-warm-300"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    rule.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" className="flex items-center gap-1">
                <Zap size={12} />
                {triggerLabel}
              </Badge>

              {rule.delay_hours > 0 && (
                <Badge variant="info" className="flex items-center gap-1">
                  <Clock size={12} />
                  {rule.delay_hours}h delay
                </Badge>
              )}

              <Badge
                variant={
                  rule.action_type === "send_sms" || rule.action_type === "send_email"
                    ? "primary"
                    : "secondary"
                }
                className="flex items-center gap-1"
              >
                <ActionIcon size={12} />
                {rule.action_type.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-warm-150">
              <div className="flex items-center gap-1 text-xs">
                <Clock size={14} className="text-warm-400" />
                <span className="text-warm-600">{rule.stats.pending} pending</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <CheckCircle size={14} className="text-success-500" />
                <span className="text-warm-600">{rule.stats.completed} sent</span>
              </div>
              {rule.stats.failed > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <XCircle size={14} className="text-danger-500" />
                  <span className="text-danger-600">{rule.stats.failed} failed</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => setEditOpen(true)}
              >
                Edit template
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={History}
                onClick={() => setHistoryOpen(true)}
              >
                View history
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <AutomationHistoryModal
        ruleId={rule.id}
        ruleName={rule.name}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      <EditTemplateModal
        ruleId={rule.id}
        ruleName={rule.name}
        currentTemplate={rule.template}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}
