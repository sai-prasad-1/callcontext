import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getDashboardAccess } from "@/lib/authz/server";
import { canAccessFeature } from "@/lib/authz/evaluate";
import { Feature } from "@/lib/authz/features";
import type { SubscriptionPlan } from "@/lib/authz/plans";
import type { ShopRole } from "@/lib/authz/roles";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["manager", "staff", "analyst"]),
});

function canInviteMembers(role: ShopRole, plan: SubscriptionPlan): boolean {
  if (role === "owner") return canAccessFeature(role, plan, Feature.TEAM_INVITE);
  if (role === "manager") return canAccessFeature(role, plan, Feature.TEAM_INVITE);
  return false;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getDashboardAccess(supabase, user.id);
  if (!access) {
    return NextResponse.json({ error: "No shop" }, { status: 404 });
  }

  const canSee =
    access.role === "owner" ||
    access.role === "manager" ||
    canAccessFeature(access.role, access.plan, Feature.TEAM_MANAGE) ||
    canAccessFeature(access.role, access.plan, Feature.TEAM_INVITE);

  if (!canSee) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: rows, error } = await supabase
    .from("shop_memberships")
    .select("user_id, role, status, created_at")
    .eq("shop_id", access.shop.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("team list:", error);
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({
      members: (rows ?? []).map((r) => ({
        userId: (r as { user_id: string }).user_id,
        email: null as string | null,
        role: (r as { role: string }).role,
        status: (r as { status: string }).status,
        createdAt: (r as { created_at: string }).created_at,
      })),
      warning: "Email resolution unavailable (server configuration).",
    });
  }

  const admin = createServiceClient();
  const members = await Promise.all(
    (rows ?? []).map(async (raw) => {
      const r = raw as {
        user_id: string;
        role: string;
        status: string;
        created_at: string;
      };
      let email: string | null = null;
      try {
        const { data, error: uErr } = await admin.auth.admin.getUserById(r.user_id);
        if (!uErr && data.user?.email) email = data.user.email;
      } catch {
        /* ignore */
      }
      return {
        userId: r.user_id,
        email,
        role: r.role,
        status: r.status,
        createdAt: r.created_at,
      };
    })
  );

  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getDashboardAccess(supabase, user.id);
  if (!access) {
    return NextResponse.json({ error: "No shop" }, { status: 404 });
  }

  if (!canInviteMembers(access.role, access.plan)) {
    return NextResponse.json(
      { error: "You cannot invite teammates on this plan or role." },
      { status: 403 }
    );
  }

  let body: z.infer<typeof inviteSchema>;
  try {
    body = inviteSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const admin = createServiceClient();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000";

    let userId: string | null = null;

    const { data: existingId, error: rpcError } = await admin.rpc("lookup_user_id_by_email", {
      lookup_email: body.email.trim(),
    });

    if (!rpcError && existingId) {
      userId = existingId as string;
    }

    if (!userId) {
      const { data: invited, error: invErr } = await admin.auth.admin.inviteUserByEmail(
        body.email.trim(),
        {
          redirectTo: `${origin.replace(/\/$/, "")}/login`,
        }
      );
      if (invErr) {
        const msg = invErr.message?.toLowerCase() ?? "";
        if (msg.includes("already") || msg.includes("registered")) {
          return NextResponse.json(
            {
              error:
                "That email may already be registered. Ask them to sign in, then try again or contact support.",
            },
            { status: 409 }
          );
        }
        console.error("inviteUserByEmail:", invErr);
        return NextResponse.json({ error: invErr.message }, { status: 400 });
      }
      userId = invited.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: "Could not resolve new user" }, { status: 500 });
    }

    const { error: insErr } = await admin.from("shop_memberships").insert({
      shop_id: access.shop.id,
      user_id: userId,
      role: body.role,
      status: "active",
    } as never);

    if (insErr) {
      if (insErr.code === "23505") {
        return NextResponse.json(
          { error: "This person is already on your team." },
          { status: 409 }
        );
      }
      console.error("membership insert:", insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, userId });
  } catch (e) {
    console.error("POST /api/shop/team:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
