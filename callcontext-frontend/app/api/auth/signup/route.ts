import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { insertShopForOwnerWithServiceRole } from "@/lib/shop/insert-shop-service-role";

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

    // Service role: session may be missing until email is verified.
    const shopResult = await insertShopForOwnerWithServiceRole({
      ownerId: authData.user.id,
      shopName,
      country: country || "US",
      state,
    });

    if (!shopResult.ok) {
      console.error("Shop creation error:", shopResult.error, shopResult.details);
      return NextResponse.json(
        {
          error: shopResult.error,
          details: shopResult.details,
        },
        { status: shopResult.httpStatus }
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
