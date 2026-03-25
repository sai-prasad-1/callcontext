import {
  ArrowRight,
  Brain,
  CalendarClock,
  Check,
  CheckCircle2,
  Flower2,
  History,
  Lightbulb,
  Mic,
  Phone,
  Search,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { Plus_Jakarta_Sans, Work_Sans } from "next/font/google";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

const headline = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type LandingPageProps = {
  isAuthenticated?: boolean;
  /** Logged-in users without a shop should not link to /dashboard (avoid redirect churn). */
  authenticatedAppHref?: string;
};

export default function LandingPage({
  isAuthenticated = false,
  authenticatedAppHref = "/dashboard",
}: LandingPageProps) {
  const needsShopSetup = isAuthenticated && authenticatedAppHref !== "/dashboard";
  const postAuthPrimaryLabel = needsShopSetup ? "Complete setup" : "Go to Dashboard";
  const postAuthOpenLabel = needsShopSetup ? "Complete setup" : "Open Dashboard";
  const postAuthFooterLabel = needsShopSetup ? "Complete setup" : "Dashboard";
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
            <a href="#features" className="text-sm font-medium text-[#3e4944] hover:text-[#00694e]">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-[#3e4944] hover:text-[#00694e]">
              Pricing
            </a>
            <a href="#resources" className="text-sm font-medium text-[#3e4944] hover:text-[#00694e]">
              Resources
            </a>
            <a href="#company" className="text-sm font-medium text-[#3e4944] hover:text-[#00694e]">
              Company
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href={authenticatedAppHref}
                className="rounded-lg bg-[#00694e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                {postAuthPrimaryLabel}
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
        <section className="px-4 pb-24 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#f6f3ef] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00694e]">
                <Sparkles size={14} />
                AI call intelligence CRM
              </p>

              <h1
                className={`${headline.className} mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1c1c19] lg:text-6xl`}
              >
                Every call has <span className="italic text-[#00694e]">gold</span> in it. You&apos;re
                losing it.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3e4944]">
                Florists are not data clerks. When someone says &quot;the same roses from last
                anniversary,&quot; don&apos;t search old notes. Let AI build your customer ledger in real
                time while you focus on service.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00694e] px-6 py-3.5 text-base font-bold text-white transition hover:brightness-110"
                  >
                    Open Dashboard
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <a
                    href="#waitlist"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00694e] px-6 py-3.5 text-base font-bold text-white transition hover:brightness-110"
                  >
                    Claim Your Ledger
                    <ArrowRight size={16} />
                  </a>
                )}
                <span className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fcb327]/20 px-4 py-2 text-sm font-medium text-[#7f5600]">
                  <Flower2 size={15} />
                  Tailored for Master Florists
                </span>
              </div>
            </div>

            <div className="relative rounded-4xl bg-[#f6f3ef] p-6 shadow-[0_12px_40px_rgba(45,143,111,0.06)] lg:rotate-2">
              <div className="rounded-xl bg-[#ffffff] p-6">
                <div className="mb-5 flex items-center justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                    <span className={`${headline.className} font-bold text-[#00694e]`}>
                      Live Call: Eleanor Vance
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#3e4944]">02:45</span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl rounded-tl-none bg-[#f0ede9] p-4">
                    <p className="text-sm italic text-[#3e4944]">
                      &quot;...looking for the same roses from March 15 for my daughter&apos;s
                      graduation.&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#fcf9f5] p-3">
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-[#3e4944]">
                        Auto-Detected Entity
                      </p>
                      <p className="flex items-center gap-2 text-sm font-bold text-[#00694e]">
                        <CalendarClock size={15} />
                        Graduation Gift
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#fcf9f5] p-3">
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-[#3e4944]">
                        Customer History
                      </p>
                      <p className="flex items-center gap-2 text-sm font-bold text-[#7f5600]">
                        <History size={15} />3 Past Orders
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 -z-10 h-28 w-28 rounded-full bg-[#00694e]/10 blur-3xl" />
            </div>
          </div>
        </section>

        <section className="bg-[#f0ede9] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2
                className={`${headline.className} text-4xl font-extrabold tracking-tight text-[#1c1c19]`}
              >
                Running a flower shop should not mean data entry work.
              </h2>
              <p className="mt-3 text-lg text-[#3e4944]">
                Manual notes lead to missed opportunities and weaker customer relationships.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {problemCards.map((card) => (
                <article key={card.title} className={`${card.shape} bg-white p-7 transition hover:-translate-y-1`}>
                  <div
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg ${card.iconBg}`}
                  >
                    <card.icon size={20} />
                  </div>
                  <h3 className={`${headline.className} text-xl font-bold text-[#1c1c19]`}>
                    {card.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-[#3e4944]">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2
              className={`${headline.className} mb-14 text-center text-4xl font-extrabold tracking-tight text-[#1c1c19]`}
            >
              The Growth Cycle
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.title} className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#00694e] text-white shadow-[0_12px_40px_rgba(45,143,111,0.06)]">
                    <step.icon size={28} />
                  </div>
                  <h3 className={`${headline.className} mt-5 text-xl font-bold text-[#1c1c19]`}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[#3e4944]">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="resources" className="bg-[#f0ede9]/50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#7f5600]">
                The signature feature
              </p>
              <h2 className={`${headline.className} mt-3 text-4xl font-extrabold tracking-tight text-[#1c1c19]`}>
                The Screen Pop effect
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[#3e4944]">
                Before you say hello, your screen shows customer context: past orders, preferences,
                and important notes. You resume relationships, not just take orders.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-[#1c1c19]">
                  <CheckCircle2 className="mt-0.5 text-[#00694e]" size={18} />
                  Zero-lag profile pop under one second
                </li>
                <li className="flex items-start gap-2 text-[#1c1c19]">
                  <CheckCircle2 className="mt-0.5 text-[#00694e]" size={18} />
                  CRM context synced with each inbound call
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white/75 p-7 backdrop-blur-xl shadow-[0_12px_40px_rgba(45,143,111,0.06)]">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#00694e]/10" />
                  <div>
                    <p className={`${headline.className} text-xl font-bold text-[#1c1c19]`}>Sarah Miller</p>
                    <p className="text-sm text-[#3e4944]">West Village, NY</p>
                  </div>
                  <span className="ml-auto rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700">
                    VIP
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#fcf9f5] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#3e4944]">Most Purchased</p>
                    <p className="mt-1 text-sm font-bold text-[#1c1c19]">White Peonies</p>
                  </div>
                  <div className="rounded-xl bg-[#fcf9f5] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#3e4944]">Lifetime Value</p>
                    <p className="mt-1 text-sm font-bold text-[#1c1c19]">$2,450.00</p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#00694e]/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#00694e]">
                    Internal Note
                  </p>
                  <p className="mt-1 text-sm italic text-[#3e4944]">
                    &quot;Prefers eco wrapping, no plastic. Daughter loves yellow tulips.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2
              className={`${headline.className} mb-14 text-center text-4xl font-extrabold tracking-tight text-[#1c1c19]`}
            >
              Tools for the modern artisan
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="space-y-3">
                  <feature.icon className="text-[#00694e]" size={30} />
                  <h3 className={`${headline.className} text-xl font-bold text-[#1c1c19]`}>
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-[#3e4944]">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#f0ede9] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2
              className={`${headline.className} mb-14 text-center text-4xl font-extrabold tracking-tight text-[#1c1c19]`}
            >
              A plan for every bloom
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {pricingPlans.map((plan) => (
                <article
                  key={plan.name}
                  className={`flex flex-col rounded-2xl p-8 ${
                    plan.featured ? "relative z-10 scale-[1.03] bg-[#00694e] text-white shadow-2xl" : "bg-white"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#7f5600] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                      Most popular
                    </span>
                  )}
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">{plan.name}</p>
                  <p className="my-5 text-4xl font-extrabold">
                    ${plan.price}
                    <span className="text-base font-medium opacity-80">/month</span>
                  </p>
                  <ul className="mb-8 grow space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check size={15} className={plan.featured ? "text-[#ffba3e]" : "text-[#00694e]"} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={isAuthenticated ? authenticatedAppHref : "/signup"}
                    className={`inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-bold transition ${
                      plan.featured
                        ? "bg-white text-[#00694e] hover:brightness-95"
                        : "bg-[#f6f3ef] text-[#00694e] hover:bg-[#ebe8e4]"
                    }`}
                  >
                    {isAuthenticated ? postAuthOpenLabel : plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="company" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2
              className={`${headline.className} mb-14 text-center text-4xl font-extrabold tracking-tight text-[#1c1c19]`}
            >
              Trusted by master florists
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((item) => (
                <article key={item.name} className="rounded-3xl bg-white p-7 italic">
                  <p className="text-lg text-[#1c1c19]">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-5">
                    <p className={`${headline.className} font-bold not-italic text-[#1c1c19]`}>
                      {item.name}
                    </p>
                    <p className="text-xs uppercase tracking-widest not-italic text-[#3e4944]">
                      {item.shop}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="waitlist" className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-4xl bg-[#00694e] p-10 text-center text-white shadow-2xl sm:p-14">
            <h2
              className={`${headline.className} mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl`}
            >
              Stop letting order details slip through your fingers.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#97f5cf]">
              Join the early access cohort and build stronger customer relationships with every
              call.
            </p>
            <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white/90 p-5 text-left text-[#1c1c19] backdrop-blur-xl">
              <WaitlistForm />
            </div>
            <p className="mt-5 text-sm text-[#97f5cf]">No credit card required. Cancel anytime.</p>
          </div>
        </section>
      </main>

      <footer className="bg-[#f6f3ef]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-8 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className={`${headline.className} text-xl font-bold text-[#00694e]`}>CallContext</p>
            <p className="mt-3 text-sm text-[#3e4944]">
              Elevating artisanal floral businesses through intelligent conversation management.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#00694e]">Product</h4>
            <ul className="space-y-2 text-sm text-[#3e4944]">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#resources">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#00694e]">Company</h4>
            <ul className="space-y-2 text-sm text-[#3e4944]">
              <li><a href="#waitlist">Contact support</a></li>
              <li><a href="#">Privacy policy</a></li>
              <li><a href="#">Terms of service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#00694e]">Access</h4>
            <div className="space-y-2 text-sm">
              {isAuthenticated ? (
                <Link href={authenticatedAppHref} className="block text-[#3e4944] hover:text-[#00694e]">
                  {postAuthFooterLabel}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="block text-[#3e4944] hover:text-[#00694e]">Login</Link>
                  <Link href="/signup" className="block text-[#3e4944] hover:text-[#00694e]">Create account</Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="py-5 text-center text-xs uppercase tracking-widest text-[#6e7a73]">
          © 2026 CallContext. All rights reserved.
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaOrgSoftware),
        }}
      />
    </div>
  );
}

const problemCards = [
  {
    icon: Waves,
    title: "Forgotten preferences",
    description:
      "Customers expect you to remember what they love. Missing those details hurts trust and repeat orders.",
    iconBg: "bg-[#ffdad6] text-[#93000a]",
    shape: "rounded-[0.75rem_2.5rem_0.75rem_2.5rem]",
  },
  {
    icon: CalendarClock,
    title: "Missed reminders",
    description:
      "Anniversary and birthday follow-ups should be consistent. Manual notes make this easy to miss.",
    iconBg: "bg-[#fcb327]/20 text-[#7f5600]",
    shape: "rounded-xl",
  },
  {
    icon: Search,
    title: "No customer history",
    description:
      "Treating repeat clients like new callers breaks premium service. Context should appear instantly.",
    iconBg: "bg-[#1d8464]/20 text-[#00694e]",
    shape: "rounded-[0.75rem_2.5rem_0.75rem_2.5rem]",
  },
];

const steps = [
  {
    icon: Phone,
    title: "Forward number",
    description:
      "Keep your current number and route inbound calls through CallContext.",
  },
  {
    icon: Mic,
    title: "Call comes in",
    description:
      "Answer normally while transcription and context capture happens live.",
  },
  {
    icon: Lightbulb,
    title: "Watch the magic",
    description:
      "Entity extraction, reminders, and customer context update automatically.",
  },
];

const features = [
  {
    icon: Mic,
    title: "Real-time transcription",
    description:
      "Every word captured live so your team focuses on conversation, not note-taking.",
  },
  {
    icon: Brain,
    title: "Auto profiles",
    description:
      "AI detects names, addresses, and preferences to keep your customer ledger fresh.",
  },
  {
    icon: CalendarClock,
    title: "Smart reminders",
    description:
      "Get nudges before important customer dates and recurring buying moments.",
  },
  {
    icon: Sparkles,
    title: "Screen pop",
    description:
      "Instant caller recognition with context the moment the phone starts ringing.",
  },
  {
    icon: History,
    title: "Full history search",
    description:
      "Search months of calls and notes with natural keywords and customer tags.",
  },
  {
    icon: Users,
    title: "Relationship continuity",
    description:
      "Make every repeat customer feel remembered with personalized call handling.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 49,
    featured: false,
    cta: "Choose Starter",
    features: ["500 minutes/month", "Real-time transcription", "Basic CRM sync"],
  },
  {
    name: "Pro",
    price: 69,
    featured: true,
    cta: "Start Pro Trial",
    features: [
      "1500 minutes/month",
      "Priority screen pop",
      "Smart reminders",
      "Advanced analytics",
    ],
  },
  {
    name: "Growth",
    price: 99,
    featured: false,
    cta: "Choose Growth",
    features: ["Unlimited minutes", "Multi-location support", "Dedicated success lead"],
  },
];

const testimonials = [
  {
    name: "Julian Thorne",
    shop: "Thorne & Stem Floral Studio",
    quote:
      "CallContext changed how we handle peak season. Customer context appears before hello, and order quality improved immediately.",
  },
  {
    name: "Mara Lin",
    shop: "Petals & Prose",
    quote:
      "Smart reminders increased repeat orders because we finally follow up at the right time, every time.",
  },
];

const schemaOrgSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CallContext",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "49",
  },
  description:
    "CallContext is a call intelligence CRM for small businesses that captures call data, summarizes intent, and automates follow-ups.",
};
