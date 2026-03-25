import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { z } from "zod";

const TierThresholdsSchema = z.object({
  bronze: z.number().min(0),
  silver: z.number().min(0),
  gold: z.number().min(0),
  platinum: z.number().min(0),
});

const RewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  points_required: z.number().min(0),
});

const UpdateSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  points_per_dollar: z.number().min(0).optional(),
  tiers: TierThresholdsSchema.optional(),
  rewards: z.array(RewardSchema).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await loadDashboardAccess(user.id);
    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: shop, error } = await supabase
      .from("shops")
      .select("settings")
      .eq("id", access.shop.id)
      .single();

    if (error || !shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const settings = shop.settings as Record<string, unknown>;
    const loyalty = (settings?.loyalty as Record<string, unknown>) ?? {};

    const defaultSettings = {
      enabled: false,
      points_per_dollar: 1,
      tiers: {
        bronze: 0,
        silver: 500,
        gold: 1500,
        platinum: 3000,
      },
      rewards: [],
    };

    return NextResponse.json({
      enabled: loyalty.enabled ?? defaultSettings.enabled,
      points_per_dollar: loyalty.points_per_dollar ?? defaultSettings.points_per_dollar,
      tiers: loyalty.tiers ?? defaultSettings.tiers,
      rewards: loyalty.rewards ?? defaultSettings.rewards,
    });
  } catch (error) {
    console.error("Error fetching loyalty settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await loadDashboardAccess(user.id);
    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (access.role !== "owner") {
      return NextResponse.json(
        { error: "Only shop owners can modify loyalty settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = UpdateSettingsSchema.parse(body);

    const { data: shop, error: fetchError } = await supabase
      .from("shops")
      .select("settings")
      .eq("id", access.shop.id)
      .single();

    if (fetchError || !shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const currentSettings = shop.settings as Record<string, unknown>;
    const currentLoyalty = (currentSettings?.loyalty as Record<string, unknown>) ?? {};

    const updatedLoyalty = {
      ...currentLoyalty,
      ...validated,
    };

    const { error: updateError } = await supabase
      .from("shops")
      .update({
        settings: {
          ...currentSettings,
          loyalty: updatedLoyalty,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", access.shop.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedLoyalty);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating loyalty settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
