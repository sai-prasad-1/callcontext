import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { TWO_PARTY_STATES } from "@/lib/utils/constants";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopName, email, password, country, state } = body;

    // Validation
    if (!shopName || !email || !password || !state) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate country (only US for now)
    if (country && country !== "US") {
      return NextResponse.json(
        {
          error: "Currently only available in the United States",
          details: "We're expanding to more countries soon!",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if tables exist (basic health check)
    const { error: healthError } = await supabase
      .from("shops")
      .select("id")
      .limit(1);

    if (healthError && healthError.code === "PGRST205") {
      return NextResponse.json(
        {
          error: "Database not set up",
          details:
            "Please run the SQL migrations in Supabase. See supabase/README.md for instructions.",
        },
        { status: 503 }
      );
    }

    // Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);

      if (
        authError.status === 429 ||
        authError.code === "over_email_send_rate_limit"
      ) {
        return NextResponse.json(
          {
            error: "Too many signup attempts. Please wait a minute and try again.",
            details:
              "Email verification is temporarily rate-limited by Supabase. You can retry shortly or use a different test email.",
            code: "over_email_send_rate_limit",
          },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }

      return NextResponse.json(
        {
          error:
            authError.message === "User already registered"
              ? "An account with this email already exists"
              : authError.message,
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Determine consent mode based on state
    const consentMode = TWO_PARTY_STATES.has(state)
      ? "always_disclose"
      : "auto";

    // Create shop profile with service-role client.
    // Reason: with email confirmation enabled, signup may not establish a session yet,
    // so auth.uid() can be null in this request and RLS insert policies will fail.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "SUPABASE_SERVICE_ROLE_KEY is missing on the server.",
        },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    const shopPayload = {
      owner_id: authData.user.id,
      name: shopName,
      country: country || "US",
      state,
      consent_mode: consentMode as "auto" | "silent" | "always_disclose",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      subscription_plan: "trial" as const,
      trial_ends_at: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString(),
      settings: {},
    };

    // Retry briefly for auth.users visibility propagation before failing hard.
    let shopError: any = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { error } = await adminSupabase.from("shops").insert([shopPayload] as any);
      shopError = error ?? null;

      if (!shopError) break;
      if (shopError.code !== "23503") break; // non-FK errors should return immediately

      await sleep(250 * (attempt + 1));
    }

    if (shopError) {
      console.error("Shop creation error:", shopError);
      const message = String(shopError.message || "");
      return NextResponse.json(
        {
          error: "Failed to create shop profile",
          details:
            message.toLowerCase().includes("invalid api key")
              ? "Supabase service role key is invalid. Update SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the server."
              : shopError.code === "23503"
              ? "User record is still syncing. Please retry signup once."
              : shopError.code === "42501"
              ? "Database permissions error. Please ensure RLS policies are set up correctly."
              : message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
