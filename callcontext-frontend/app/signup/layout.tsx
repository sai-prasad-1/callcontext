import AuthLayout from "@/components/layout/AuthLayout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";

export default async function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const access = await loadDashboardAccess(user.id);
    if (access) {
      redirect("/dashboard");
    }
    redirect("/onboarding");
  }

  return <AuthLayout>{children}</AuthLayout>;
}
