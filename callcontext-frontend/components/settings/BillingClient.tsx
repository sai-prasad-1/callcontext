"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Gauge,
  ExternalLink,
  Check,
  Crown,
  Zap,
  Rocket,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  PAY_PER_MINUTE_USD,
  estimatedUsageChargeUsd,
  formatUsd,
} from "@/lib/billing/pricing";
import { STRIPE_PLANS, type StripePlanKey } from "@/lib/stripe/plans";
import type { BillingMode } from "@/lib/shop/billing-settings";

type BillingClientProps = {
  planLabel: string;
  currentPlan: string;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  usageBillingEnabled: boolean;
  preferredBillingMode: BillingMode | null;
  canEdit: boolean;
  checkoutSessionId: string | null;
};

const planIcons: Record<StripePlanKey, React.ReactNode> = {
  starter: <Zap size={20} />,
  pro: <Crown size={20} />,
  growth: <Rocket size={20} />,
};

const planDisplayNames: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  growth: "Growth",
};

export function BillingClient({
  planLabel: initialPlanLabel,
  currentPlan: initialPlan,
  trialEndsAt,
  stripeCustomerId,
  stripeSubscriptionId: initialSubId,
  usageBillingEnabled: initialUsage,
  preferredBillingMode: initialMode,
  canEdit,
  checkoutSessionId,
}: BillingClientProps) {
  const [planLabel, setPlanLabel] = useState(initialPlanLabel);
  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [hasSubscription, setHasSubscription] = useState(Boolean(initialSubId));

  const [minutes, setMinutes] = useState("100");
  const [usageEnabled, setUsageEnabled] = useState(initialUsage);
  const [mode, setMode] = useState<BillingMode>(initialMode ?? "subscription");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const [checkoutStatus, setCheckoutStatus] = useState<
    | { type: "verifying" }
    | { type: "success"; plan: string | null }
    | { type: "error"; message: string }
    | null
  >(checkoutSessionId ? { type: "verifying" } : null);

  const verifySession = useCallback(async (sessionId: string) => {
    setCheckoutStatus({ type: "verifying" });
    try {
      const res = await fetch(
        `/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setCheckoutStatus({
          type: "error",
          message: data.error || "Could not verify payment",
        });
        return;
      }

      if (data.verified) {
        const newPlan = data.plan || "active";
        setCheckoutStatus({ type: "success", plan: newPlan });
        if (data.plan && data.plan in STRIPE_PLANS) {
          setCurrentPlan(data.plan);
          setPlanLabel(planDisplayNames[data.plan] || data.plan);
          setHasSubscription(true);
        }
        // Clean URL without reload
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", url.toString());
      } else {
        setCheckoutStatus({
          type: "error",
          message: `Payment status: ${data.payment_status || "pending"}. Please wait a moment and refresh.`,
        });
      }
    } catch {
      setCheckoutStatus({
        type: "error",
        message: "Network error verifying payment. Please refresh the page.",
      });
    }
  }, []);

  useEffect(() => {
    if (checkoutSessionId) {
      verifySession(checkoutSessionId);
    }
  }, [checkoutSessionId, verifySession]);

  const est =
    minutes.trim() === ""
      ? 0
      : estimatedUsageChargeUsd(Number.parseFloat(minutes) || 0);

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
      if (patch.usage_billing_enabled !== undefined)
        setUsageEnabled(patch.usage_billing_enabled);
      if (patch.preferred_billing_mode) setMode(patch.preferred_billing_mode);
      setMessage("Saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function handleCheckout(plan: StripePlanKey) {
    setCheckoutLoading(plan);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not start checkout");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Portal error");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not open portal");
    } finally {
      setPortalLoading(false);
    }
  }

  const isTrial = currentPlan === "trial";

  return (
    <div className="space-y-8">
      {/* Post-checkout banner */}
      {checkoutStatus?.type === "verifying" && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 p-4">
          <Loader2 size={20} className="animate-spin text-brand-600" />
          <p className="text-sm font-medium text-brand-800">
            Verifying your payment…
          </p>
        </div>
      )}

      {checkoutStatus?.type === "success" && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-success-200 bg-success-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-success-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success-800">
                Subscription activated!
              </p>
              <p className="text-sm text-success-700 mt-0.5">
                {checkoutStatus.plan && checkoutStatus.plan in planDisplayNames
                  ? `You're now on the ${planDisplayNames[checkoutStatus.plan]} plan.`
                  : "Your subscription is now active."}{" "}
                You can manage invoices and payment methods from the billing portal.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCheckoutStatus(null)}
            className="text-success-600 hover:text-success-800 transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {checkoutStatus?.type === "error" && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-danger-200 bg-danger-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-danger-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-danger-800">
                Payment verification issue
              </p>
              <p className="text-sm text-danger-700 mt-0.5">
                {checkoutStatus.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCheckoutStatus(null)}
            className="text-danger-600 hover:text-danger-800 transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="text-brand-600" size={20} />
            <h2 className="font-display text-lg font-semibold text-warm-900">
              Subscription
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={isTrial ? "warning" : "success"}>
              {planLabel}
            </Badge>
            {isTrial && trialEndsAt && (
              <span className="text-sm text-warm-600">
                Trial ends{" "}
                <span className="font-medium text-warm-800">
                  {new Date(trialEndsAt).toLocaleDateString()}
                </span>
              </span>
            )}
            {hasSubscription && !isTrial && (
              <span className="text-sm text-success-700 font-medium">
                Active subscription
              </span>
            )}
          </div>

          {stripeCustomerId && (
            <p className="text-xs text-warm-500">
              Stripe customer: {stripeCustomerId.slice(0, 14)}…
            </p>
          )}

          {canEdit && (stripeCustomerId || hasSubscription) && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePortal}
              disabled={portalLoading}
              className="mt-2"
            >
              {portalLoading ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <ExternalLink size={16} className="mr-2" />
              )}
              {hasSubscription
                ? "Manage subscription & invoices"
                : "Open billing portal"}
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Plan picker */}
      {canEdit && (
        <div>
          <h3 className="font-display text-lg font-semibold text-warm-900 mb-4">
            {isTrial ? "Choose a plan" : "Change plan"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              Object.entries(STRIPE_PLANS) as [
                StripePlanKey,
                (typeof STRIPE_PLANS)[StripePlanKey],
              ][]
            ).map(([key, plan]) => {
              const isCurrentPlan = currentPlan === key;
              return (
                <Card
                  key={key}
                  className={`relative ${
                    key === "pro"
                      ? "border-brand-400 shadow-md"
                      : "border-warm-200"
                  } ${isCurrentPlan ? "ring-2 ring-brand-500" : ""}`}
                >
                  {key === "pro" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="info">Most Popular</Badge>
                    </div>
                  )}
                  <CardBody className="flex flex-col gap-4 pt-6">
                    <div className="flex items-center gap-2 text-warm-800">
                      {planIcons[key]}
                      <span className="font-display text-lg font-semibold">
                        {plan.name}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-warm-900">
                      ${(plan.monthlyPriceCents / 100).toFixed(0)}
                      <span className="text-sm font-normal text-warm-500">
                        /month
                      </span>
                    </p>
                    <ul className="space-y-2 text-sm text-warm-600 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-success-600 mt-0.5 shrink-0"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      variant={
                        isCurrentPlan
                          ? "ghost"
                          : key === "pro"
                            ? "primary"
                            : "secondary"
                      }
                      className="w-full"
                      disabled={isCurrentPlan || checkoutLoading !== null}
                      onClick={() => handleCheckout(key)}
                    >
                      {checkoutLoading === key ? (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      ) : null}
                      {isCurrentPlan
                        ? "Current plan"
                        : isTrial
                          ? "Subscribe"
                          : "Switch to " + plan.name}
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Usage billing */}
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
            Billable call minutes are charged at{" "}
            <strong className="text-warm-800">
              {formatUsd(PAY_PER_MINUTE_USD)}
            </strong>{" "}
            per minute on top of your base subscription when usage billing is
            enabled.
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
                ≈{" "}
                <span className="font-semibold text-warm-900">
                  {formatUsd(est)}
                </span>{" "}
                at current rate
              </p>
            </div>
          </div>

          {canEdit ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-warm-700">
                  Billing mode
                </label>
                <select
                  className="w-full max-w-md rounded-md border border-warm-200 bg-white px-3 py-2 text-sm text-warm-800 cursor-pointer"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as BillingMode)}
                  disabled={saving}
                >
                  <option value="subscription">Subscription only</option>
                  <option value="usage">Usage only (per-minute)</option>
                  <option value="hybrid">
                    Hybrid (subscription + usage)
                  </option>
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-warm-300 text-brand-600 cursor-pointer"
                  checked={usageEnabled}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setUsageEnabled(v);
                    void savePrefs({ usage_billing_enabled: v });
                  }}
                  disabled={saving}
                />
                <span className="text-sm text-warm-700">
                  Enable usage-based metering for this shop
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
