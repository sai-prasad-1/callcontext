import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { ToastProvider } from "@/components/ui/Toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch shop data
  const { data: shop } = await supabase
    .from("shops")
    .select("name")
    .eq("owner_id", user.id)
    .single() as { data: { name: string } | null };

  // If user doesn't have a shop yet (shouldn't happen after signup, but handle gracefully)
  if (!shop) {
    // Could redirect to onboarding or shop creation page
    // For now, allow access with placeholder
  }

  // TODO: Fetch user profile for firstName/lastName once profiles table is set up
  const userData = {
    email: user.email || "",
    firstName: null,
    lastName: null,
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex">
        {/* Sidebar - Desktop only */}
        <Sidebar user={userData} shopName={shop?.name} />

        {/* Main Content */}
        <div className="flex-1 lg:ml-60 flex flex-col">
          {/* Header */}
          <Header user={userData} notificationCount={0} />

          {/* Page Content */}
          <main className="flex-1 bg-warm-50 p-6 pb-20 lg:pb-6 overflow-auto">
            {children}
          </main>
        </div>

        {/* Mobile Nav - Mobile only */}
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
