import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
      // Successfully authenticated, redirect to dashboard
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
  
  // Redirect to appropriate page
  if (user) {
    // User is authenticated, go to dashboard
    // This will be caught by (dashboard)/page.tsx
    redirect("/dashboard");
  } else {
    // User is not authenticated, go to login
    redirect("/login");
  }
}

