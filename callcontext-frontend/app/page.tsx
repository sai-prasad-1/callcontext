import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/landing/LandingPage";

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  
  // Handle auth callback codes (email verification, password reset, etc.)
  if (params.code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    
    if (!error) {
      // Successfully authenticated; keep users on landing and update navbar behavior
      redirect("/");
    } else {
      // Failed to exchange code, redirect to login with error
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  }
  
  // Handle auth errors (e.g., from OAuth providers)
  if (params.error) {
    redirect(`/login?error=${encodeURIComponent(params.error_description || params.error)}`);
  }
  
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Always render landing at "/" and let UI adapt based on auth state.
  return <LandingPage isAuthenticated={Boolean(user)} />;
}

