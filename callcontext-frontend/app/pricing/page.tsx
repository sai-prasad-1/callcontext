import { createClient } from "@/lib/supabase/server";
import PricingPageClient from "./PricingPageClient";

export const metadata = {
  title: "Pricing | CallContext",
  description:
    "Simple, transparent pricing for every business size. Start with a 14-day free trial, no credit card required.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const authenticatedAppHref = "/dashboard";

  return (
    <PricingPageClient
      isAuthenticated={isAuthenticated}
      authenticatedAppHref={authenticatedAppHref}
    />
  );
}
