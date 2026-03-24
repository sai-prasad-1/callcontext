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

  const { data: shop } = (await supabase
    .from("shops")
    .select("name")
    .eq("owner_id", user.id)
    .single()) as { data: { name: string } | null };

  const userData = {
    email: user.email || "",
    firstName: null,
    lastName: null,
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex">
        <Sidebar user={userData} shopName={shop?.name} />

        <div className="flex-1 lg:ml-60 flex flex-col">
          <Header user={userData} notificationCount={0} />

          <main className="flex-1 bg-warm-50 p-6 pb-20 lg:pb-6 overflow-auto">
            {children}
          </main>
        </div>

        <MobileNav />
      </div>
    </ToastProvider>
  );
}
