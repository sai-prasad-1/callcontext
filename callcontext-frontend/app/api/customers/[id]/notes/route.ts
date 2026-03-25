import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const createNoteSchema = z.object({
  content: z.string().min(1),
  pinned: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  let body: z.infer<typeof createNoteSchema>;
  try {
    body = createNoteSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { id: customerId } = await params;

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      shop_id: access.shop.id,
      customer_id: customerId,
      content: body.content,
      pinned: body.pinned ?? false,
      created_by: user.id,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(note, { status: 201 });
}
