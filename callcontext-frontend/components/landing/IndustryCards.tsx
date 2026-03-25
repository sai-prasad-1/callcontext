import { Flower, Cake, Scissors, Wrench, Heart, Utensils, LucideIcon } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const headline = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

interface IndustryCard {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}

const industries: IndustryCard[] = [
  {
    icon: Flower,
    title: "Florists",
    description: "Track orders, preferences, and special occasions",
    iconColor: "text-pink-600",
    iconBg: "bg-pink-50",
  },
  {
    icon: Cake,
    title: "Bakeries",
    description: "Manage custom orders and dietary preferences",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    icon: Scissors,
    title: "Salons",
    description: "Schedule appointments and track client preferences",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    icon: Wrench,
    title: "Auto Shops",
    description: "Track service history and maintenance schedules",
    iconColor: "text-slate-600",
    iconBg: "bg-slate-50",
  },
  {
    icon: Heart,
    title: "Vet Clinics",
    description: "Manage pet records and vaccination schedules",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
  {
    icon: Utensils,
    title: "Restaurants",
    description: "Handle catering and event bookings",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
  },
];

export function IndustryCards() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2
            className={`${headline.className} text-4xl font-extrabold tracking-tight text-[#1c1c19]`}
          >
            Built for Every Business
          </h2>
          <p className="mt-3 text-lg text-[#3e4944]">
            From artisan shops to professional services, CallContext adapts to your workflow
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <article
              key={industry.title}
              className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00694e] hover:shadow-[0_8px_30px_rgba(0,105,78,0.12)] border border-transparent"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${industry.iconBg} transition-transform duration-300 group-hover:scale-110`}
              >
                <industry.icon size={24} className={industry.iconColor} />
              </div>
              <h3 className={`${headline.className} text-xl font-bold text-[#1c1c19]`}>
                {industry.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#3e4944]">
                {industry.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
