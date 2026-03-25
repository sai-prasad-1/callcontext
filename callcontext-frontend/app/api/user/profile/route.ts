import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  display_name: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    first_name: user.user_metadata?.first_name ?? null,
    last_name: user.user_metadata?.last_name ?? null,
    display_name: user.user_metadata?.display_name ?? null,
    phone: user.user_metadata?.phone ?? null,
    created_at: user.created_at,
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const metadata: Record<string, string | undefined> = {};
  if (body.first_name !== undefined) metadata.first_name = body.first_name;
  if (body.last_name !== undefined) metadata.last_name = body.last_name;
  if (body.display_name !== undefined) metadata.display_name = body.display_name;
  if (body.phone !== undefined) metadata.phone = body.phone;

  const { error } = await supabase.auth.updateUser({ data: metadata });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
