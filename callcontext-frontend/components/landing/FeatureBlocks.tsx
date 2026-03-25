import {
  Phone,
  Users,
  Package,
  CheckSquare,
  BarChart3,
  Mail,
  Award,
  Zap,
  Webhook,
  Brain,
  LucideIcon,
} from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const headline = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: Phone,
    title: "Call Intelligence",
    description:
      "Real-time transcription and AI-powered summaries turn every call into actionable insights. Never miss a detail again.",
    iconColor: "text-[#00694e]",
  },
  {
    icon: Users,
    title: "Customer Profiles",
    description:
      "Auto-enriched profiles with purchase history, preferences, and notes. Screen pop shows full context before you say hello.",
    iconColor: "text-[#00694e]",
  },
  {
    icon: Package,
    title: "Smart Orders",
    description:
      "Extract order details from conversations automatically. Track delivery dates, occasions, and special instructions effortlessly.",
    iconColor: "text-[#00694e]",
  },
  {
    icon: CheckSquare,
    title: "Tasks & Reminders",
    description:
      "AI detects follow-ups and creates reminders automatically. Get notified before birthdays, anniversaries, and recurring orders.",
    iconColor: "text-[#00694e]",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Visualize call volume, sentiment trends, and customer growth. Identify your busiest hours and top customers instantly.",
    iconColor: "text-[#00694e]",
  },
  {
    icon: Mail,
    title: "Marketing Campaigns",
    description:
      "Send targeted email and SMS campaigns to customer segments. Track open rates, clicks, and conversions in real-time.",
    iconColor: "text-[#00694e]",
  },
  {
    icon: Award,
    title: "Loyalty Program",
    description:
      "Built-in points system with tier management. Reward repeat customers and drive retention with automated incentives.",
    iconColor: "text-[#00694e]",
  },
  {
    icon: Zap,
    title: "Automation Rules",
    description:
      "Create custom triggers and actions for routine tasks. Send welcome messages, update tags, and create follow-ups automatically.",
    iconColor: "text-[#00694e]",
  },
  {
    icon: Webhook,
    title: "Webhooks & API",
    description:
      "Integrate with your existing tools via REST API and webhooks. Sync data with Zapier, Make, or custom integrations.",
    iconColor: "text-[#00694e]",
  },
  {
    icon: Brain,
    title: "Smart Suggestions",
    description:
      "Get AI-powered recommendations for upsells, follow-ups, and personalized service based on customer history and patterns.",
    iconColor: "text-[#00694e]",
  },
];

export function FeatureBlocks() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2
            className={`${headline.className} text-4xl font-extrabold tracking-tight text-[#1c1c19]`}
          >
            Everything you need to grow
          </h2>
          <p className="mt-3 text-lg text-[#3e4944]">
            Powerful features that work together to transform your customer relationships
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group space-y-3 rounded-xl bg-gradient-to-br from-[#fcf9f5] to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,105,78,0.08)]"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#00694e]/10 transition-all duration-300 group-hover:bg-[#00694e] group-hover:scale-110">
                <feature.icon
                  size={22}
                  className={`${feature.iconColor} transition-colors duration-300 group-hover:text-white`}
                />
              </div>
              <h3 className={`${headline.className} text-xl font-bold text-[#1c1c19]`}>
                {feature.title}
              </h3>
              <p className="leading-relaxed text-[#3e4944]">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
