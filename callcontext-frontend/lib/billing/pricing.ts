/** USD per billable call minute when usage-based metering is enabled. */
export const PAY_PER_MINUTE_USD = 0.05;

export function estimatedUsageChargeUsd(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  return Math.round(minutes * PAY_PER_MINUTE_USD * 100) / 100;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
