"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const headline = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does CallContext work?",
    answer:
      "CallContext integrates with your existing phone system by forwarding your calls through our platform. When a call comes in, we automatically transcribe it in real-time, extract key information like customer details and order specifics, and update your CRM instantly. You continue answering calls normally while AI handles all the data entry.",
  },
  {
    question: "What phone systems are supported?",
    answer:
      "We currently support Vonage as our primary telephony provider, with more integrations coming soon. You can forward your existing business number to CallContext, and we'll handle the rest. No need to change your phone number or provider.",
  },
  {
    question: "Can I try it for free?",
    answer:
      "Yes! All new accounts start with a 14-day free trial with full access to all features. No credit card required to start. You can explore the platform, import your customer data, and see the AI in action before committing to a paid plan.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Pricing starts at $49/month for the Starter plan with 300 call minutes included. Our most popular Pro plan is $69/month with 1,000 minutes and advanced features. For high-volume businesses, the Growth plan offers unlimited minutes at $99/month. Check out our pricing page for a detailed comparison.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption for all data in transit and at rest. Your call recordings and customer data are stored securely on Supabase with regular backups. We're GDPR and CCPA compliant, and we never share your data with third parties. You own your data and can export or delete it anytime.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes, you can export your customer data, call records, and order history at any time in CSV format. There's no vendor lock-in—your data is yours. Simply go to any list view and click the export button to download your data instantly.",
  },
  {
    question: "Do you offer API access?",
    answer:
      "Yes! All paid plans include access to our REST API and webhook system. You can integrate CallContext with your existing tools, build custom automations, or sync data with platforms like Zapier, Make, or your own applications. Full API documentation is available in our developer portal.",
  },
  {
    question: "What support do you provide?",
    answer:
      "All users have access to our comprehensive documentation and email support. Pro and Growth plan subscribers get priority email support with faster response times. Growth plan customers also receive a dedicated account manager for onboarding and ongoing assistance.",
  },
];

interface AccordionItemProps {
  faq: FAQItem;
  isOpen: boolean;
  onClick: () => void;
}

function AccordionItem({ faq, isOpen, onClick }: AccordionItemProps) {
  return (
    <div className="rounded-xl border border-[#e5e1db] bg-white shadow-sm transition-all duration-200 hover:border-[#00694e]/30">
      <button
        onClick={onClick}
        className="flex w-full items-start justify-between gap-4 p-6 text-left transition-colors"
        aria-expanded={isOpen}
      >
        <span className={`${headline.className} text-lg font-semibold text-[#1c1c19]`}>
          {faq.question}
        </span>
        <span className="flex-shrink-0 rounded-full bg-[#00694e]/10 p-1 transition-all duration-300">
          {isOpen ? (
            <Minus size={18} className="text-[#00694e]" />
          ) : (
            <Plus size={18} className="text-[#00694e]" />
          )}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-[#e5e1db] px-6 pb-6 pt-4">
          <p className="leading-relaxed text-[#3e4944]">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#f0ede9]/50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2
            className={`${headline.className} text-4xl font-extrabold tracking-tight text-[#1c1c19]`}
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-lg text-[#3e4944]">
            Everything you need to know about CallContext
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
