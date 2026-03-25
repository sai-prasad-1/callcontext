import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { Plus_Jakarta_Sans, Work_Sans } from "next/font/google";
import { PricingTable } from "@/components/landing/PricingTable";
import { FAQAccordion } from "@/components/landing/FAQAccordion";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const headline = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Pricing | CallContext",
  description:
    "Simple, transparent pricing for every business size. Start with a 14-day free trial, no credit card required.",
};

export default async function PricingPage() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const authenticatedAppHref = "/dashboard";

  return (
    <div className={`${body.className} min-h-screen bg-[#fcf9f5] text-[#1c1c19]`}>
      <header className="sticky top-0 z-40 bg-[#fcf9f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#00694e] text-white">
              <Phone size={18} />
            </span>
            <span className={`${headline.className} text-xl font-bold text-[#00694e]`}>
              CallContext
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/#features" className="text-sm font-medium text-[#3e4944] hover:text-[#00694e]">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-[#00694e] underline underline-offset-4">
              Pricing
            </Link>
            <Link href="/#faq" className="text-sm font-medium text-[#3e4944] hover:text-[#00694e]">
              FAQ
            </Link>
            <Link href="/#company" className="text-sm font-medium text-[#3e4944] hover:text-[#00694e]">
              Company
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href={authenticatedAppHref}
                className="rounded-lg bg-[#00694e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-4 py-2 text-sm font-medium text-[#3e4944] hover:bg-[#ebe8e4] sm:inline"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#00694e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-12 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#f6f3ef] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00694e]">
              Simple & Transparent
            </p>

            <h1
              className={`${headline.className} mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1c1c19] lg:text-6xl`}
            >
              Choose the perfect plan for your business
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#3e4944]">
              Start with a 14-day free trial. All plans include core features like call transcription,
              customer CRM, and screen pop. No credit card required to start.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {!isAuthenticated && (
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00694e] px-6 py-3.5 text-base font-bold text-white transition hover:brightness-110"
                >
                  Start Free Trial
                  <ArrowRight size={16} />
                </Link>
              )}
              <Link
                href="/#company"
                className="text-sm font-medium text-[#3e4944] hover:text-[#00694e]"
              >
                Have questions? Contact us
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <PricingTable
              isAuthenticated={isAuthenticated}
              authenticatedAppHref={authenticatedAppHref}
              showComparison={true}
            />
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#f6f3ef] to-[#fcf9f5] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2
                className={`${headline.className} text-3xl font-extrabold tracking-tight text-[#1c1c19]`}
              >
                All plans include
              </h2>
              <p className="mt-3 text-lg text-[#3e4944]">
                Core features available on every plan
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {coreFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex-shrink-0 rounded-full bg-[#00694e]/10 p-1">
                    <svg
                      className="h-4 w-4 text-[#00694e]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#1c1c19]">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FAQAccordion />

        <section className="bg-[#00694e] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h2
              className={`${headline.className} text-4xl font-extrabold tracking-tight sm:text-5xl`}
            >
              Ready to transform your customer calls?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#97f5cf]">
              Join hundreds of businesses already using CallContext to build stronger customer
              relationships with every call.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {isAuthenticated ? (
                <Link
                  href={authenticatedAppHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-bold text-[#00694e] transition hover:brightness-95"
                >
                  Go to Dashboard
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-bold text-[#00694e] transition hover:brightness-95"
                  >
                    Start Free Trial
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/#company"
                    className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-transparent px-6 py-3.5 text-base font-bold text-white transition hover:border-white/50 hover:bg-white/10"
                  >
                    Contact Sales
                  </Link>
                </>
              )}
            </div>
            <p className="mt-6 text-sm text-[#97f5cf]">No credit card required • Cancel anytime</p>
          </div>
        </section>
      </main>

      <footer className="bg-[#f6f3ef]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-8 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className={`${headline.className} text-xl font-bold text-[#00694e]`}>CallContext</p>
            <p className="mt-3 text-sm text-[#3e4944]">
              Elevating artisanal businesses through intelligent conversation management.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#00694e]">Product</h4>
            <ul className="space-y-2 text-sm text-[#3e4944]">
              <li>
                <Link href="/#features">Features</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/#faq">FAQ</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#00694e]">Company</h4>
            <ul className="space-y-2 text-sm text-[#3e4944]">
              <li>
                <Link href="/#company">Contact support</Link>
              </li>
              <li>
                <a href="#">Privacy policy</a>
              </li>
              <li>
                <a href="#">Terms of service</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#00694e]">Access</h4>
            <div className="space-y-2 text-sm">
              {isAuthenticated ? (
                <Link href={authenticatedAppHref} className="block text-[#3e4944] hover:text-[#00694e]">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="block text-[#3e4944] hover:text-[#00694e]">
                    Login
                  </Link>
                  <Link href="/signup" className="block text-[#3e4944] hover:text-[#00694e]">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="py-5 text-center text-xs uppercase tracking-widest text-[#6e7a73]">
          © 2026 CallContext. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const coreFeatures = [
  "Real-time call transcription",
  "Customer CRM with auto-enrichment",
  "Screen pop with caller context",
  "Call history & search",
  "Order tracking",
  "Smart reminders",
  "Task management",
  "Email & SMS notifications",
  "Data export (CSV)",
  "Mobile responsive dashboard",
  "Secure cloud storage",
  "Regular backups",
];
