import AuthLayout from "@/components/layout/AuthLayout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    redirect("/dashboard");
  }

  return <AuthLayout>{children}</AuthLayout>;
}
