"use client";

import { useState } from "react";
import { CreditCard, Gauge } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  PAY_PER_MINUTE_USD,
  estimatedUsageChargeUsd,
  formatUsd,
} from "@/lib/billing/pricing";
import type { BillingMode } from "@/lib/shop/billing-settings";

type BillingClientProps = {
  planLabel: string;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
  usageBillingEnabled: boolean;
  preferredBillingMode: BillingMode | null;
  canEdit: boolean;
};

export function BillingClient({
  planLabel,
  trialEndsAt,
  stripeCustomerId,
  usageBillingEnabled: initialUsage,
  preferredBillingMode: initialMode,
  canEdit,
}: BillingClientProps) {
  const [minutes, setMinutes] = useState("100");
  const [usageEnabled, setUsageEnabled] = useState(initialUsage);
  const [mode, setMode] = useState<BillingMode>(initialMode ?? "subscription");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const est =
    minutes.trim() === "" ? 0 : estimatedUsageChargeUsd(Number.parseFloat(minutes) || 0);

  async function savePrefs(patch: {
    usage_billing_enabled?: boolean;
    preferred_billing_mode?: BillingMode;
  }) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/shop/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (patch.usage_billing_enabled !== undefined) {
        setUsageEnabled(patch.usage_billing_enabled);
      }
      if (patch.preferred_billing_mode) {
        setMode(patch.preferred_billing_mode);
      }
      setMessage("Saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="text-brand-600" size={20} />
            <h2 className="font-display text-lg font-semibold text-warm-900">Subscription</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-warm-600">
            Current plan:{" "}
            <span className="font-semibold text-warm-800 capitalize">{planLabel}</span>
          </p>
          {trialEndsAt && (
            <p className="text-sm text-warm-600">
              Trial ends:{" "}
              <span className="font-medium text-warm-800">
                {new Date(trialEndsAt).toLocaleDateString()}
              </span>
            </p>
          )}
          <p className="text-sm text-warm-500">
            Card management and invoices will connect to Stripe.{" "}
            {stripeCustomerId ? (
              <span className="text-warm-700">Customer ID on file.</span>
            ) : (
              <span>Complete checkout when you upgrade from trial.</span>
            )}
          </p>
          <Button type="button" variant="secondary" size="sm" disabled className="mt-2">
            Open billing portal (coming soon)
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="text-brand-600" size={20} />
            <h2 className="font-display text-lg font-semibold text-warm-900">
              Pay-per-minute usage
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          <p className="text-sm leading-relaxed text-warm-600">
            When enabled, billable call minutes are charged at{" "}
            <strong className="text-warm-800">{formatUsd(PAY_PER_MINUTE_USD)}</strong> per
            minute. You can combine this with a base subscription (hybrid) later via Stripe
            metered prices.
          </p>

          <div className="rounded-lg bg-warm-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-warm-500">
              Quick estimate
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                type="number"
                min={0}
                step={1}
                label="Billable minutes (example)"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
              <p className="text-sm text-warm-700 pb-2">
                ≈ <span className="font-semibold text-warm-900">{formatUsd(est)}</span> at
                current rate
              </p>
            </div>
          </div>

          {canEdit ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-warm-700">Billing mode</label>
                <select
                  className="w-full max-w-md rounded-md border border-warm-200 bg-white px-3 py-2 text-sm text-warm-800"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as BillingMode)}
                  disabled={saving}
                >
                  <option value="subscription">Subscription only</option>
                  <option value="usage">Usage only (per-minute)</option>
                  <option value="hybrid">Hybrid (subscription + usage)</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-warm-300 text-brand-600"
                  checked={usageEnabled}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setUsageEnabled(v);
                    void savePrefs({ usage_billing_enabled: v });
                  }}
                  disabled={saving}
                />
                <span className="text-sm text-warm-700">
                  Enable usage-based metering for this shop (stored in shop settings; Stripe
                  wiring is next).
                </span>
              </label>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={saving}
                onClick={() => savePrefs({ preferred_billing_mode: mode })}
              >
                Save billing mode
              </Button>
            </>
          ) : (
            <p className="text-sm text-warm-500">
              Only the shop owner can change billing and metering options.
            </p>
          )}

          {message && (
            <p className="text-sm text-warm-600" role="status">
              {message}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
