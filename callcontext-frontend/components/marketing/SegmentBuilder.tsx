"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, DollarSign, Calendar, Users, Tag as TagIcon } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/formatting";
import type { SegmentFilter } from "@/lib/utils/segment-filters";

type Condition = {
  id: string;
  field: string;
  operator: string;
  value: any;
};

type SegmentWithCount = {
  id: string;
  name: string;
  description: string | null;
  filter: Record<string, any>;
  is_preset: boolean;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  existingSegment?: SegmentWithCount | null;
}

const FIELD_OPTIONS = [
  { value: "loyalty_tier", label: "Loyalty tier", icon: Users },
  { value: "last_contact", label: "Last contact", icon: Calendar },
  { value: "lifetime_value", label: "Lifetime value", icon: DollarSign },
  { value: "total_calls", label: "Total calls", icon: Users },
  { value: "tags", label: "Tags", icon: TagIcon },
  { value: "created_date", label: "Created date", icon: Calendar },
];

const OPERATOR_OPTIONS: Record<string, { value: string; label: string }[]> = {
  loyalty_tier: [{ value: "is_one_of", label: "is one of" }],
  last_contact: [
    { value: "within", label: "within" },
    { value: "more_than", label: "more than" },
  ],
  lifetime_value: [
    { value: "at_least", label: "at least" },
    { value: "at_most", label: "at most" },
    { value: "between", label: "between" },
  ],
  total_calls: [
    { value: "at_least", label: "at least" },
    { value: "at_most", label: "at most" },
  ],
  tags: [
    { value: "has_all", label: "has all" },
    { value: "has_any", label: "has any" },
  ],
  created_date: [{ value: "within", label: "within" }],
};

const LOYALTY_TIERS = ["bronze", "silver", "gold", "platinum"];

const COMMON_TAGS = [
  "VIP",
  "Regular",
  "New",
  "Corporate",
  "Event Planner",
  "Recurring",
  "Holiday Client",
  "Premium",
  "Referral",
  "Walk-in",
];

export function SegmentBuilder({ open, onClose, onSave, existingSegment }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && existingSegment) {
      setName(existingSegment.name);
      setDescription(existingSegment.description ?? "");
      setConditions(filterToConditions(existingSegment.filter));
    } else if (open) {
      setName("");
      setDescription("");
      setConditions([]);
      setLiveCount(null);
    }
  }, [open, existingSegment]);

  const fetchLiveCount = useCallback(async (filter: SegmentFilter) => {
    setLoadingCount(true);
    try {
      const res = await fetch("/api/segments/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter }),
      });
      if (!res.ok) throw new Error("Failed to fetch count");
      const data = await res.json();
      setLiveCount(data.count);
    } catch (error) {
      console.error("Failed to fetch count:", error);
      setLiveCount(null);
    } finally {
      setLoadingCount(false);
    }
  }, []);

  useEffect(() => {
    if (!open || conditions.length === 0) {
      setLiveCount(null);
      return;
    }

    const timeout = setTimeout(() => {
      const filter = conditionsToFilter(conditions);
      fetchLiveCount(filter);
    }, 500);

    return () => clearTimeout(timeout);
  }, [conditions, open, fetchLiveCount]);

  function addCondition() {
    setConditions([
      ...conditions,
      {
        id: Math.random().toString(36).substring(7),
        field: "loyalty_tier",
        operator: "is_one_of",
        value: ["gold"],
      },
    ]);
  }

  function removeCondition(id: string) {
    setConditions(conditions.filter((c) => c.id !== id));
  }

  function updateCondition(id: string, updates: Partial<Condition>) {
    setConditions(
      conditions.map((c) => {
        if (c.id !== id) return c;
        
        const newCondition = { ...c, ...updates };
        
        if (updates.field) {
          const operators = OPERATOR_OPTIONS[updates.field];
          newCondition.operator = operators[0].value;
          
          switch (updates.field) {
            case "loyalty_tier":
              newCondition.value = ["bronze"];
              break;
            case "last_contact":
            case "created_date":
              newCondition.value = 30;
              break;
            case "lifetime_value":
              newCondition.value = newCondition.operator === "between" ? [0, 1000] : 100;
              break;
            case "total_calls":
              newCondition.value = 5;
              break;
            case "tags":
              newCondition.value = [];
              break;
          }
        }
        
        if (updates.operator === "between" && c.field === "lifetime_value" && !Array.isArray(newCondition.value)) {
          newCondition.value = [0, 1000];
        } else if (updates.operator !== "between" && c.field === "lifetime_value" && Array.isArray(newCondition.value)) {
          newCondition.value = 100;
        }
        
        return newCondition;
      })
    );
  }

  function toggleLoyaltyTier(conditionId: string, tier: string) {
    setConditions(
      conditions.map((c) => {
        if (c.id !== conditionId) return c;
        const current = Array.isArray(c.value) ? c.value : [];
        return {
          ...c,
          value: current.includes(tier)
            ? current.filter((t) => t !== tier)
            : [...current, tier],
        };
      })
    );
  }

  function toggleTag(conditionId: string, tag: string) {
    setConditions(
      conditions.map((c) => {
        if (c.id !== conditionId) return c;
        const current = Array.isArray(c.value) ? c.value : [];
        return {
          ...c,
          value: current.includes(tag)
            ? current.filter((t) => t !== tag)
            : [...current, tag],
        };
      })
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Please enter a segment name");
      return;
    }

    if (conditions.length === 0) {
      alert("Please add at least one condition");
      return;
    }

    setSaving(true);
    try {
      const filter = conditionsToFilter(conditions);
      const url = existingSegment
        ? `/api/segments/${existingSegment.id}`
        : "/api/segments";
      const method = existingSegment ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          filter,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save segment");
        return;
      }

      onSave();
    } catch (error) {
      alert("Failed to save segment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={existingSegment ? "Edit segment" : "Create segment"}
      size="lg"
    >
      <div className="space-y-6">
        <Input
          label="Segment name"
          placeholder="e.g. VIP Customers"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">
            Description
          </label>
          <textarea
            placeholder="Optional description for this segment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={cn(
              "w-full px-3 py-2 text-sm text-warm-700 bg-white border border-warm-200 rounded-md transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              "disabled:bg-warm-50 disabled:opacity-60"
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-warm-700">
              Conditions
              <span className="text-warm-500 font-normal ml-1">(all must match)</span>
            </label>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={addCondition}
            >
              Add condition
            </Button>
          </div>

          {conditions.length === 0 ? (
            <div className="p-6 border border-dashed border-warm-300 rounded-lg text-center">
              <p className="text-sm text-warm-600">
                No conditions yet. Add a condition to define your segment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition) => (
                <ConditionRow
                  key={condition.id}
                  condition={condition}
                  onUpdate={(updates) => updateCondition(condition.id, updates)}
                  onRemove={() => removeCondition(condition.id)}
                  onToggleLoyaltyTier={(tier) => toggleLoyaltyTier(condition.id, tier)}
                  onToggleTag={(tag) => toggleTag(condition.id, tag)}
                />
              ))}
            </div>
          )}
        </div>

        {conditions.length > 0 && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
            <p className="text-sm text-warm-700">
              {loadingCount ? (
                <>Loading...</>
              ) : liveCount !== null ? (
                <>
                  <span className="font-semibold text-brand-700">{liveCount}</span>{" "}
                  {liveCount === 1 ? "customer matches" : "customers match"} this
                  segment
                </>
              ) : (
                <>Enter conditions to see live count</>
              )}
            </p>
          </div>
        )}

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : existingSegment ? "Update segment" : "Create segment"}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

function ConditionRow({
  condition,
  onUpdate,
  onRemove,
  onToggleLoyaltyTier,
  onToggleTag,
}: {
  condition: Condition;
  onUpdate: (updates: Partial<Condition>) => void;
  onRemove: () => void;
  onToggleLoyaltyTier: (tier: string) => void;
  onToggleTag: (tag: string) => void;
}) {
  const operators = OPERATOR_OPTIONS[condition.field] ?? [];

  return (
    <div className="p-4 border border-warm-200 rounded-lg bg-warm-50 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={condition.field}
            onChange={(e) => onUpdate({ field: e.target.value })}
            className="h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {FIELD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={condition.operator}
            onChange={(e) => onUpdate({ operator: e.target.value })}
            className="h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {operators.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={X}
          onClick={onRemove}
          className="shrink-0"
        >
          Remove
        </Button>
      </div>

      <ValueInput
        condition={condition}
        onUpdate={onUpdate}
        onToggleLoyaltyTier={onToggleLoyaltyTier}
        onToggleTag={onToggleTag}
      />
    </div>
  );
}

function ValueInput({
  condition,
  onUpdate,
  onToggleLoyaltyTier,
  onToggleTag,
}: {
  condition: Condition;
  onUpdate: (updates: Partial<Condition>) => void;
  onToggleLoyaltyTier: (tier: string) => void;
  onToggleTag: (tag: string) => void;
}) {
  switch (condition.field) {
    case "loyalty_tier":
      return (
        <div className="flex flex-wrap gap-2">
          {LOYALTY_TIERS.map((tier) => {
            const selected = Array.isArray(condition.value) && condition.value.includes(tier);
            return (
              <button
                key={tier}
                onClick={() => onToggleLoyaltyTier(tier)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors capitalize",
                  selected
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-warm-700 border-warm-200 hover:bg-warm-50"
                )}
              >
                {tier}
              </button>
            );
          })}
        </div>
      );

    case "last_contact":
    case "created_date":
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={condition.value || ""}
            onChange={(e) => onUpdate({ value: parseInt(e.target.value) || 1 })}
            className="w-24 h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <span className="text-sm text-warm-600">days</span>
        </div>
      );

    case "lifetime_value":
      if (condition.operator === "between") {
        const values = Array.isArray(condition.value) ? condition.value : [0, 1000];
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-sm text-warm-600 mr-2">$</span>
              <input
                type="number"
                min="0"
                step="10"
                value={values[0] || ""}
                onChange={(e) =>
                  onUpdate({ value: [parseInt(e.target.value) || 0, values[1]] })
                }
                className="w-28 h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <span className="text-sm text-warm-600">and</span>
            <div className="flex items-center">
              <span className="text-sm text-warm-600 mr-2">$</span>
              <input
                type="number"
                min="0"
                step="10"
                value={values[1] || ""}
                onChange={(e) =>
                  onUpdate({ value: [values[0], parseInt(e.target.value) || 0] })
                }
                className="w-28 h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-warm-600">$</span>
          <input
            type="number"
            min="0"
            step="10"
            value={condition.value || ""}
            onChange={(e) => onUpdate({ value: parseInt(e.target.value) || 0 })}
            className="w-32 h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      );

    case "total_calls":
      return (
        <input
          type="number"
          min="1"
          value={condition.value || ""}
          onChange={(e) => onUpdate({ value: parseInt(e.target.value) || 1 })}
          className="w-24 h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      );

    case "tags":
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map((tag) => {
              const selected = Array.isArray(condition.value) && condition.value.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
                    selected
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-warm-700 border-warm-200 hover:bg-warm-50"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          {Array.isArray(condition.value) && condition.value.length > 0 && (
            <p className="text-xs text-warm-600">
              Selected: {condition.value.join(", ")}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}

function conditionsToFilter(conditions: Condition[]): SegmentFilter {
  const filter: SegmentFilter = {};

  conditions.forEach((c) => {
    switch (c.field) {
      case "loyalty_tier":
        filter.loyalty_tier = c.value;
        break;
      case "last_contact":
        if (c.operator === "within") {
          filter.last_contact_days = c.value;
        } else if (c.operator === "more_than") {
          filter.last_contact_days_min = c.value;
        }
        break;
      case "lifetime_value":
        if (c.operator === "at_least") {
          filter.lifetime_value_min = c.value;
        } else if (c.operator === "at_most") {
          filter.lifetime_value_max = c.value;
        } else if (c.operator === "between") {
          filter.lifetime_value_min = c.value[0];
          filter.lifetime_value_max = c.value[1];
        }
        break;
      case "total_calls":
        if (c.operator === "at_least") {
          filter.total_calls_min = c.value;
        }
        break;
      case "tags":
        filter.tags = c.value;
        break;
      case "created_date":
        filter.created_days = c.value;
        break;
    }
  });

  return filter;
}

function filterToConditions(filter: Record<string, any>): Condition[] {
  const conditions: Condition[] = [];

  if (filter.loyalty_tier) {
    conditions.push({
      id: Math.random().toString(36).substring(7),
      field: "loyalty_tier",
      operator: "is_one_of",
      value: filter.loyalty_tier,
    });
  }

  if (filter.last_contact_days !== undefined) {
    conditions.push({
      id: Math.random().toString(36).substring(7),
      field: "last_contact",
      operator: "within",
      value: filter.last_contact_days,
    });
  }

  if (filter.last_contact_days_min !== undefined) {
    conditions.push({
      id: Math.random().toString(36).substring(7),
      field: "last_contact",
      operator: "more_than",
      value: filter.last_contact_days_min,
    });
  }

  if (filter.lifetime_value_min !== undefined && filter.lifetime_value_max !== undefined) {
    conditions.push({
      id: Math.random().toString(36).substring(7),
      field: "lifetime_value",
      operator: "between",
      value: [filter.lifetime_value_min, filter.lifetime_value_max],
    });
  } else if (filter.lifetime_value_min !== undefined) {
    conditions.push({
      id: Math.random().toString(36).substring(7),
      field: "lifetime_value",
      operator: "at_least",
      value: filter.lifetime_value_min,
    });
  } else if (filter.lifetime_value_max !== undefined) {
    conditions.push({
      id: Math.random().toString(36).substring(7),
      field: "lifetime_value",
      operator: "at_most",
      value: filter.lifetime_value_max,
    });
  }

  if (filter.total_calls_min !== undefined) {
    conditions.push({
      id: Math.random().toString(36).substring(7),
      field: "total_calls",
      operator: "at_least",
      value: filter.total_calls_min,
    });
  }

  if (filter.tags) {
    conditions.push({
      id: Math.random().toString(36).substring(7),
      field: "tags",
      operator: "has_all",
      value: filter.tags,
    });
  }

  if (filter.created_days !== undefined) {
    conditions.push({
      id: Math.random().toString(36).substring(7),
      field: "created_date",
      operator: "within",
      value: filter.created_days,
    });
  }

  return conditions;
}
