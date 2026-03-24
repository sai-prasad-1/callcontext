"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, PhoneCall, TriangleAlert } from "lucide-react";

const storyFlow = [
  {
    pain: "Calls come in back-to-back. Your team misses details while juggling tasks.",
    impact: "Leads cool down, callbacks slip, and order accuracy drops.",
    resolution:
      "CallContext captures intent, customer details, and next actions in real time so nothing gets lost.",
  },
  {
    pain: "Staff spend time writing notes after calls instead of helping customers.",
    impact: "Manual logging creates delays and inconsistent CRM data.",
    resolution:
      "Every call is auto-summarized and structured into CRM-ready context without extra admin work.",
  },
  {
    pain: "Follow-ups depend on memory and sticky notes.",
    impact: "Missed callbacks and low repeat conversion hurt revenue.",
    resolution:
      "Automated reminders and suggested next steps keep your pipeline moving.",
  },
];

export function StoryFlowSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll("[data-flow-card]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="story" ref={sectionRef} className="border-y border-warm-150 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            The customer call journey
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-warm-900 sm:text-4xl">
            From call chaos to consistent follow-through
          </h2>
          <p className="mt-4 text-warm-600">
            When a visitor scrolls this section, they should immediately understand: we see the pain,
            we show the impact, and we resolve it with a clear workflow.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {storyFlow.map((item, idx) => (
            <article
              key={item.pain}
              data-flow-card
              className="flow-card grid gap-4 rounded-xl border border-warm-150 bg-warm-25 p-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]"
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-danger-700">
                  <TriangleAlert size={14} />
                  Pain point
                </p>
                <p className="mt-2 text-sm leading-6 text-warm-700">{item.pain}</p>
              </div>

              <div className="hidden items-center justify-center md:flex">
                <ArrowRight className="text-warm-400" size={18} />
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-warning-700">
                  <PhoneCall size={14} />
                  Business impact
                </p>
                <p className="mt-2 text-sm leading-6 text-warm-700">{item.impact}</p>
              </div>

              <div className="hidden items-center justify-center md:flex">
                <ArrowRight className="text-warm-400" size={18} />
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-success-700">
                  <CheckCircle2 size={14} />
                  CallContext resolution
                </p>
                <p className="mt-2 text-sm leading-6 text-warm-700">{item.resolution}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
