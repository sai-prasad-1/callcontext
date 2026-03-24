import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TWO_PARTY_STATES } from "@/lib/utils/constants";

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

    // Create shop - this happens AFTER user creation
    // The user is now authenticated in this session
    const { error: shopError } = await supabase.from("shops").insert([
      {
        owner_id: authData.user.id,
        name: shopName,
        country: country || "US",
        state,
        consent_mode: consentMode as "auto" | "silent" | "always_disclose",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        subscription_plan: "trial" as const,
        trial_ends_at: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(), // 14 days
        settings: {},
      },
    ] as any);

    if (shopError) {
      console.error("Shop creation error:", shopError);

      // If shop creation fails, we should ideally delete the user
      // but for now, log the error and return a helpful message
      return NextResponse.json(
        {
          error: "Failed to create shop profile",
          details:
            shopError.code === "42501"
              ? "Database permissions error. Please ensure RLS policies are set up correctly."
              : shopError.message,
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
