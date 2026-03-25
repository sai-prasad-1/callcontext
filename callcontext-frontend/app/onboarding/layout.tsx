import AuthLayout from "@/components/layout/AuthLayout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?message=${encodeURIComponent("Sign in to create your shop.")}`);
  }

  const access = await loadDashboardAccess(user.id);
  if (access) {
    redirect("/dashboard");
  }

  return <AuthLayout>{children}</AuthLayout>;
}
