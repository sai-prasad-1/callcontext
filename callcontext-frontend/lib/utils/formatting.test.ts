import { describe, it, expect } from "vitest";
import {
  formatPhone,
  formatDuration,
  formatRelativeDate,
  getInitials,
  cn,
} from "../formatting";

describe("formatPhone", () => {
  it("formats 10-digit US phone numbers", () => {
    expect(formatPhone("5551234567")).toBe("(555) 123-4567");
  });

  it("formats 11-digit US phone numbers with country code", () => {
    expect(formatPhone("15551234567")).toBe("+1 (555) 123-4567");
  });

  it("returns original input for invalid formats", () => {
    expect(formatPhone("123")).toBe("123");
    expect(formatPhone("invalid")).toBe("invalid");
  });
});

describe("formatDuration", () => {
  it("formats seconds to MM:SS", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(125)).toBe("2:05");
    expect(formatDuration(3661)).toBe("61:01");
  });

  it("pads seconds with zero", () => {
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(5)).toBe("0:05");
  });
});

describe("formatRelativeDate", () => {
  it("formats today", () => {
    const today = new Date();
    expect(formatRelativeDate(today)).toBe("Today");
  });

  it("formats yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday)).toBe("Yesterday");
  });

  it("formats days ago", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(formatRelativeDate(threeDaysAgo)).toBe("3d ago");
  });

  it("formats weeks ago", () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    expect(formatRelativeDate(twoWeeksAgo)).toBe("2w ago");
  });
});

describe("getInitials", () => {
  it("returns initials from first and last name", () => {
    expect(getInitials("John", "Doe")).toBe("JD");
    expect(getInitials("Alice", "Smith")).toBe("AS");
  });

  it("handles single name", () => {
    expect(getInitials("John", null)).toBe("J");
    expect(getInitials(null, "Doe")).toBe("D");
  });

  it("returns ? for no names", () => {
    expect(getInitials(null, null)).toBe("?");
    expect(getInitials(undefined, undefined)).toBe("?");
  });
});

describe("cn", () => {
  it("combines multiple class names", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", false, "bar", null, "baz", undefined)).toBe(
      "foo bar baz"
    );
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
    expect(cn("base", !isActive && "active")).toBe("base");
  });
});
