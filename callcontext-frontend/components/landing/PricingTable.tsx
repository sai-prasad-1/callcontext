import { Check, X } from "lucide-react";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

const headline = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

interface PricingTier {
  key: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  featured?: boolean;
  cta: string;
  ctaHref: string;
}

interface PricingTableProps {
  isAuthenticated?: boolean;
  authenticatedAppHref?: string;
  showComparison?: boolean;
}

export function PricingTable({
  isAuthenticated = false,
  authenticatedAppHref = "/dashboard",
  showComparison = false,
}: PricingTableProps) {
  const pricingTiers: PricingTier[] = [
    {
      key: "trial",
      name: "Trial",
      price: 0,
      description: "Try all features free for 14 days",
      features: [
        "14-day free trial",
        "All Pro features included",
        "Up to 300 call minutes",
        "No credit card required",
        "Email support",
      ],
      cta: "Start Free Trial",
      ctaHref: isAuthenticated ? authenticatedAppHref : "/signup",
    },
    {
      key: "starter",
      name: "Starter",
      price: 49,
      description: "Perfect for small teams getting started",
      features: [
        "Up to 300 call minutes/mo",
        "Customer CRM",
        "Call transcription",
        "1 team member",
        "Basic analytics",
        "Email support",
      ],
      cta: "Choose Starter",
      ctaHref: isAuthenticated ? authenticatedAppHref : "/signup",
    },
    {
      key: "pro",
      name: "Pro",
      price: 69,
      description: "Most popular for growing businesses",
      featured: true,
      features: [
        "Up to 1,000 call minutes/mo",
        "AI call insights",
        "5 team members",
        "Marketing campaigns",
        "Advanced analytics",
        "Automation rules",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      ctaHref: isAuthenticated ? authenticatedAppHref : "/signup",
    },
    {
      key: "growth",
      name: "Growth",
      price: 99,
      description: "Scale with unlimited access",
      features: [
        "Unlimited call minutes",
        "Advanced analytics",
        "Unlimited team members",
        "Custom integrations",
        "API & webhooks",
        "Loyalty program",
        "Dedicated account manager",
      ],
      cta: "Choose Growth",
      ctaHref: isAuthenticated ? authenticatedAppHref : "/signup",
    },
  ];

  const comparisonFeatures = [
    { name: "Call minutes/month", trial: "300", starter: "300", pro: "1,000", growth: "Unlimited" },
    { name: "Team members", trial: "1", starter: "1", pro: "5", growth: "Unlimited" },
    { name: "Call transcription", trial: true, starter: true, pro: true, growth: true },
    { name: "Customer CRM", trial: true, starter: true, pro: true, growth: true },
    { name: "Screen pop", trial: true, starter: true, pro: true, growth: true },
    { name: "AI call insights", trial: true, starter: false, pro: true, growth: true },
    { name: "Tasks & reminders", trial: true, starter: false, pro: true, growth: true },
    { name: "Basic analytics", trial: true, starter: true, pro: true, growth: true },
    { name: "Advanced analytics", trial: true, starter: false, pro: true, growth: true },
    { name: "Marketing campaigns", trial: true, starter: false, pro: true, growth: true },
    { name: "Loyalty program", trial: true, starter: false, pro: false, growth: true },
    { name: "Automation rules", trial: true, starter: false, pro: true, growth: true },
    { name: "API & webhooks", trial: true, starter: false, pro: false, growth: true },
    { name: "Email support", trial: true, starter: true, pro: true, growth: true },
    { name: "Priority support", trial: false, starter: false, pro: true, growth: true },
    { name: "Dedicated account manager", trial: false, starter: false, pro: false, growth: true },
  ];

  return (
    <div className="space-y-12">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier) => (
          <article
            key={tier.key}
            className={`flex flex-col rounded-2xl p-8 transition-all duration-300 ${
              tier.featured
                ? "relative z-10 scale-[1.03] bg-[#00694e] text-white shadow-2xl"
                : "bg-white shadow-sm hover:shadow-md"
            }`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#fcb327] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1c1c19]">
                Most popular
              </span>
            )}
            <div className="mb-6">
              <p
                className={`text-xs font-bold uppercase tracking-widest ${
                  tier.featured ? "text-white/80" : "text-[#00694e]"
                }`}
              >
                {tier.name}
              </p>
              <div className="my-4">
                <span className={`${headline.className} text-5xl font-extrabold`}>
                  ${tier.price}
                </span>
                <span
                  className={`text-base font-medium ${tier.featured ? "text-white/80" : "text-[#3e4944]"}`}
                >
                  /month
                </span>
              </div>
              <p
                className={`text-sm ${tier.featured ? "text-white/90" : "text-[#3e4944]"}`}
              >
                {tier.description}
              </p>
            </div>

            <ul className="mb-8 grow space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check
                    size={18}
                    className={`flex-shrink-0 ${tier.featured ? "text-[#ffba3e]" : "text-[#00694e]"}`}
                  />
                  <span className={tier.featured ? "text-white" : "text-[#1c1c19]"}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.ctaHref}
              className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition ${
                tier.featured
                  ? "bg-white text-[#00694e] hover:brightness-95"
                  : "bg-[#00694e] text-white hover:brightness-110"
              }`}
            >
              {tier.cta}
            </Link>
          </article>
        ))}
      </div>

      {showComparison && (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-[#e5e1db]">
              <tr>
                <th className="px-6 py-4 text-left">
                  <span className={`${headline.className} text-lg font-bold text-[#1c1c19]`}>
                    Feature Comparison
                  </span>
                </th>
                {pricingTiers.map((tier) => (
                  <th key={tier.key} className="px-6 py-4 text-center">
                    <span
                      className={`${headline.className} text-sm font-bold uppercase tracking-wider text-[#00694e]`}
                    >
                      {tier.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr
                  key={feature.name}
                  className={index % 2 === 0 ? "bg-[#fcf9f5]" : "bg-white"}
                >
                  <td className="px-6 py-3 text-sm font-medium text-[#1c1c19]">
                    {feature.name}
                  </td>
                  {["trial", "starter", "pro", "growth"].map((tier) => {
                    const value = feature[tier as keyof typeof feature];
                    return (
                      <td key={tier} className="px-6 py-3 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check size={18} className="mx-auto text-[#00694e]" />
                          ) : (
                            <X size={18} className="mx-auto text-[#9e9891]" />
                          )
                        ) : (
                          <span className="text-sm text-[#3e4944]">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
