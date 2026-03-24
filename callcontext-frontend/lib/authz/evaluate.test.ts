import { describe, expect, it } from "vitest";
import { Feature } from "@/lib/authz/features";
import { ShopRole } from "@/lib/authz/roles";
import { SubscriptionPlan } from "@/lib/authz/plans";
import { canAccessFeature, listAllowedFeatures } from "@/lib/authz/evaluate";

describe("canAccessFeature", () => {
  it("owner on trial gets marketing when plan gates starter+", () => {
    expect(
      canAccessFeature(ShopRole.OWNER, SubscriptionPlan.TRIAL, Feature.MARKETING_ACCESS)
    ).toBe(false);
    expect(
      canAccessFeature(ShopRole.OWNER, SubscriptionPlan.STARTER, Feature.MARKETING_ACCESS)
    ).toBe(true);
  });

  it("staff on pro cannot access marketing", () => {
    expect(
      canAccessFeature(ShopRole.STAFF, SubscriptionPlan.PRO, Feature.MARKETING_ACCESS)
    ).toBe(false);
  });

  it("analyst on pro can use advanced analytics", () => {
    expect(
      canAccessFeature(ShopRole.ANALYST, SubscriptionPlan.PRO, Feature.ANALYTICS_ADVANCED)
    ).toBe(true);
  });

  it("analyst on starter cannot use advanced analytics (plan gate)", () => {
    expect(
      canAccessFeature(ShopRole.ANALYST, SubscriptionPlan.STARTER, Feature.ANALYTICS_ADVANCED)
    ).toBe(false);
  });
});

describe("listAllowedFeatures", () => {
  it("returns a stable non-empty set for owner trial", () => {
    const list = listAllowedFeatures(ShopRole.OWNER, SubscriptionPlan.TRIAL);
    expect(list.length).toBeGreaterThan(0);
    expect(list).toContain(Feature.DASHBOARD_VIEW);
    expect(list).not.toContain(Feature.MARKETING_ACCESS);
  });
});
