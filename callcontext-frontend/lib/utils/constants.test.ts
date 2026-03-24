import { describe, it, expect } from "vitest";
import { TWO_PARTY_STATES, PLAN_LIMITS, NAV_ITEMS } from "../constants";

describe("TWO_PARTY_STATES", () => {
  it("is a Set containing state codes", () => {
    expect(TWO_PARTY_STATES).toBeInstanceOf(Set);
    expect(TWO_PARTY_STATES.has("CA")).toBe(true);
    expect(TWO_PARTY_STATES.has("NY")).toBe(false);
  });

  it("contains expected two-party consent states", () => {
    expect(TWO_PARTY_STATES.has("FL")).toBe(true);
    expect(TWO_PARTY_STATES.has("IL")).toBe(true);
    expect(TWO_PARTY_STATES.has("MA")).toBe(true);
  });
});

describe("PLAN_LIMITS", () => {
  it("defines trial plan correctly", () => {
    expect(PLAN_LIMITS.trial.calls).toBe(1000);
    expect(PLAN_LIMITS.trial.price).toBe(0);
    expect(PLAN_LIMITS.trial.name).toBe("Trial");
  });

  it("defines paid plans correctly", () => {
    expect(PLAN_LIMITS.starter.calls).toBe(300);
    expect(PLAN_LIMITS.pro.calls).toBe(1000);
    expect(PLAN_LIMITS.growth.calls).toBe(-1); // unlimited
  });
});

describe("NAV_ITEMS", () => {
  it("contains expected navigation items", () => {
    expect(NAV_ITEMS.length).toBeGreaterThan(0);
    expect(NAV_ITEMS[0]).toHaveProperty("label");
    expect(NAV_ITEMS[0]).toHaveProperty("href");
    expect(NAV_ITEMS[0]).toHaveProperty("icon");
  });

  it("includes Dashboard as first item", () => {
    expect(NAV_ITEMS[0].label).toBe("Dashboard");
    expect(NAV_ITEMS[0].href).toBe("/");
  });
});
