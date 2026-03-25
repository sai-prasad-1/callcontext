import { createClient } from "@/lib/supabase/server";
import { CreateShopForm } from "@/components/onboarding/CreateShopForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <CreateShopForm userEmail={user?.email ?? null} />;
}
