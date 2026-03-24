import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

const verifyOtpMock = vi.fn();
const exchangeCodeForSessionMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      verifyOtp: verifyOtpMock,
      exchangeCodeForSession: exchangeCodeForSessionMock,
    },
  })),
}));

describe("GET /api/auth/callback", () => {
  beforeEach(() => {
    verifyOtpMock.mockReset();
    exchangeCodeForSessionMock.mockReset();
  });

  it("verifies recovery token and redirects to safe next path", async () => {
    verifyOtpMock.mockResolvedValueOnce({ error: null });

    const request = new NextRequest(
      "https://callcontext.vercel.app/api/auth/callback?token_hash=abc123&type=recovery&next=/reset-password"
    );
    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://callcontext.vercel.app/reset-password"
    );
    expect(verifyOtpMock).toHaveBeenCalledWith({
      type: "recovery",
      token_hash: "abc123",
    });
  });

  it("redirects to login with clear message when recovery token is invalid", async () => {
    verifyOtpMock.mockResolvedValueOnce({ error: { message: "invalid token" } });

    const request = new NextRequest(
      "https://callcontext.vercel.app/api/auth/callback?token_hash=bad&type=recovery&next=/reset-password"
    );
    const response = await GET(request);
    const location = response.headers.get("location") || "";

    expect(location).toContain("https://callcontext.vercel.app/login?error=");
    expect(location).toContain(
      encodeURIComponent("Reset link is invalid or expired. Please request a new one.")
    );
  });

  it("prevents open redirect when next is not a relative path", async () => {
    exchangeCodeForSessionMock.mockResolvedValueOnce({ error: null });

    const request = new NextRequest(
      "https://callcontext.vercel.app/api/auth/callback?code=my-code&next=https://evil.example"
    );
    const response = await GET(request);

    expect(response.headers.get("location")).toBe("https://callcontext.vercel.app/");
  });
});
