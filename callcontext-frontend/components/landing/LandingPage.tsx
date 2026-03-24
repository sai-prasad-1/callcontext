import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Phone,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-50 text-warm-800">
      <header className="sticky top-0 z-40 border-b border-warm-150 bg-warm-25/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Phone size={18} />
            </span>
            <span className="font-display text-xl font-semibold text-brand-600">
              CallContext
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-warm-600 hover:text-brand-600">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-warm-600 hover:text-brand-600">
              How it works
            </a>
            <a href="#pricing" className="text-sm text-warm-600 hover:text-brand-600">
              Pricing
            </a>
            <a href="#waitlist" className="text-sm text-warm-600 hover:text-brand-600">
              Waitlist
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:inline"
            >
              Sign in
            </Link>
            <a
              href="#waitlist"
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
            >
              Join waitlist
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-warm-150">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
                <Sparkles size={14} />
                AI call intelligence CRM
              </p>

              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-warm-900 sm:text-5xl">
                Capture every customer call, without hiring extra staff.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-warm-600 sm:text-lg">
                CallContext helps phone-first businesses answer faster, log details automatically,
                and follow up on every lead. You get clear transcripts, customer context, and
                revenue insights in one place.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#waitlist"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
                >
                  Get early access
                  <ArrowRight size={16} />
                </a>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md border border-warm-200 bg-white px-5 py-3 text-sm font-semibold text-warm-700 transition hover:bg-warm-50"
                >
                  Start free trial
                </Link>
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                {heroStats.map((item) => (
                  <div key={item.label} className="rounded-lg border border-warm-150 bg-white p-4">
                    <dt className="text-warm-500">{item.label}</dt>
                    <dd className="mt-1 text-xl font-semibold text-warm-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-semibold text-warm-900">Live call snapshot</h2>
              <p className="mt-2 text-sm text-warm-500">
                A single view for your caller, intent, and next action while the call is still active.
              </p>

              <div className="mt-6 space-y-4">
                <article className="rounded-lg border border-warm-150 bg-warm-25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                    Caller context
                  </p>
                  <p className="mt-2 text-sm text-warm-700">
                    <span className="font-semibold text-warm-900">Sarah Martinez</span> called about
                    a repeat order. Last order was 14 days ago.
                  </p>
                </article>

                <article className="rounded-lg border border-warm-150 bg-warm-25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                    AI summary
                  </p>
                  <p className="mt-2 text-sm text-warm-700">
                    Intent: order inquiry. Sentiment: positive. Suggested action: offer bundle and
                    schedule next follow-up in 7 days.
                  </p>
                </article>

                <article className="rounded-lg border border-warm-150 bg-warm-25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                    Team impact
                  </p>
                  <p className="mt-2 text-sm text-warm-700">
                    Auto-log calls to CRM, reduce manual notes, and improve callback completion rates.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-semibold text-warm-900 sm:text-4xl">
              Built for busy teams that run on phone calls
            </h2>
            <p className="mt-4 text-warm-600">
              Every feature is focused on speed-to-answer, better context, and reliable follow-up.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-warm-150 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md"
              >
                <feature.icon className="text-brand-600" size={20} />
                <h3 className="mt-4 font-display text-lg font-semibold text-warm-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-warm-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-warm-150 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="font-display text-3xl font-semibold text-warm-900 sm:text-4xl">
              How CallContext works
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step, idx) => (
                <article key={step.title} className="rounded-xl border border-warm-150 bg-warm-25 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                    Step {idx + 1}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-warm-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-warm-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-semibold text-warm-900 sm:text-4xl">
              Transparent pricing for every stage
            </h2>
            <p className="mt-4 text-warm-600">
              Start on trial, then pick a plan based on your call volume.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-xl border p-6 shadow-sm ${
                  plan.featured
                    ? "border-brand-300 bg-brand-50"
                    : "border-warm-150 bg-white"
                }`}
              >
                {plan.featured && (
                  <p className="inline-flex rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    Most popular
                  </p>
                )}
                <h3 className="mt-3 font-display text-2xl font-semibold text-warm-900">{plan.name}</h3>
                <p className="mt-2 text-warm-600">
                  <span className="text-4xl font-semibold text-warm-900">${plan.price}</span>/month
                </p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-warm-700">
                      <CheckCircle2 size={16} className="mt-0.5 text-brand-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="waitlist" className="border-t border-warm-150 bg-warm-100/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl font-semibold text-warm-900 sm:text-4xl">
                Join the early-access waitlist
              </h2>
              <p className="mt-4 text-warm-600">
                We are onboarding businesses in batches to ensure high call quality, clean setup, and
                reliable support from day one.
              </p>
            </div>
            <div className="mt-10">
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-warm-150 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-warm-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 CallContext. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-brand-600">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-brand-600">
              Create account
            </Link>
          </div>
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

const heroStats = [
  { label: "Businesses onboarded", value: "500+" },
  { label: "Average setup", value: "5 min" },
  { label: "Manual logging reduced", value: "10x" },
];

const features = [
  {
    icon: Brain,
    title: "Real-time AI summaries",
    description:
      "Automatically extract caller intent, key details, and next actions before the call ends.",
  },
  {
    icon: Users,
    title: "Customer context on every call",
    description:
      "See prior orders, notes, and reminders instantly so your team responds with context.",
  },
  {
    icon: Clock,
    title: "Follow-up automation",
    description:
      "Create reminders and tasks from call outcomes to reduce missed callbacks and lost leads.",
  },
  {
    icon: TrendingUp,
    title: "Revenue and call insights",
    description:
      "Track conversion signals, repeat callers, and pipeline movement from your phone channel.",
  },
  {
    icon: Shield,
    title: "Compliance-ready workflows",
    description:
      "Consent modes and secure storage built for two-party consent states and auditability.",
  },
  {
    icon: Phone,
    title: "Fast phone setup",
    description:
      "Forward your business line and start capturing structured call data without hardware.",
  },
];

const steps = [
  {
    title: "Connect your number",
    description:
      "Forward your existing business line and verify your shop profile in minutes.",
  },
  {
    title: "Capture structured call data",
    description:
      "CallContext logs customer details, intent, and outcomes to your CRM automatically.",
  },
  {
    title: "Close the loop",
    description:
      "Use reminders, notes, and analytics to follow up consistently and improve conversion.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 49,
    featured: false,
    cta: "Start free trial",
    features: [
      "100 calls per month",
      "Real-time transcription",
      "Basic CRM timeline",
      "Email support",
      "7-day history",
    ],
  },
  {
    name: "Pro",
    price: 149,
    featured: true,
    cta: "Start free trial",
    features: [
      "500 calls per month",
      "Advanced AI call insights",
      "Reminders and follow-ups",
      "Priority support",
      "90-day history",
      "Integrations",
    ],
  },
  {
    name: "Growth",
    price: 299,
    featured: false,
    cta: "Start free trial",
    features: [
      "Unlimited calls",
      "Multi-location support",
      "Team collaboration",
      "Dedicated onboarding",
      "Unlimited history",
      "API access",
    ],
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
