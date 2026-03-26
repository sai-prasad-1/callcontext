import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { ToastProvider } from "@/components/ui/Toast";
import { LiveCallNotifications } from "@/components/notifications/LiveCallNotifications";

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

  const access = await loadDashboardAccess(user.id);
  if (!access) {
    redirect("/onboarding");
  }

  const meta = user.user_metadata || {};
  const userData = {
    email: user.email || "",
    firstName: (meta.first_name as string) || null,
    lastName: (meta.last_name as string) || null,
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex">
        <Sidebar
          user={userData}
          shopName={access.shop.name}
          allowedFeatures={access.allowedFeatures}
        />

        <div className="flex-1 lg:ml-60 flex flex-col">
          <Header user={userData} userId={user.id} />

          <main className="flex-1 bg-warm-50 p-6 pb-20 lg:pb-6 overflow-auto">
            {children}
          </main>
        </div>

        <MobileNav allowedFeatures={access.allowedFeatures} />
        
        <LiveCallNotifications />
      </div>
    </ToastProvider>
  );
}
