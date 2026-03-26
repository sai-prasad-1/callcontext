"use client";

import { ArrowRight, Check, Phone, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PricingPageProps {
  isAuthenticated?: boolean;
  authenticatedAppHref?: string;
}

export default function PricingPageClient({
  isAuthenticated = false,
  authenticatedAppHref = "/dashboard",
}: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] font-['Inter']">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 rounded-full mt-4 mx-auto max-w-7xl border border-[#3c4a42]/20 bg-[#0c1324]/60 backdrop-blur-xl shadow-[0px_20px_40px_rgba(78,222,163,0.04)] font-['Manrope'] font-medium tracking-tight text-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#4edea3] tracking-tighter">CallContext</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#product" className="text-[#dce1fb]/70 hover:text-[#dce1fb] transition-colors">Product</Link>
          <Link href="/pricing" className="text-[#4edea3] font-semibold border-b-2 border-[#4edea3] pb-1">Pricing</Link>
          <Link href="/contact" className="text-[#dce1fb]/70 hover:text-[#dce1fb] transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              href={authenticatedAppHref}
              className="bg-[#4edea3] hover:bg-[#10b981] text-[#003824] px-5 py-2 rounded-full font-bold transition-all duration-300 scale-100 active:scale-95"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[#dce1fb]/70 hover:text-[#dce1fb] transition-colors">Sign in</Link>
              <Link href="/signup" className="bg-[#4edea3] hover:bg-[#10b981] text-[#003824] px-5 py-2 rounded-full font-bold transition-all duration-300 scale-100 active:scale-95">
                Start free trial
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-44 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151b2d] border border-[#3c4a42]/10 mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4edea3]">Simple & Transparent Pricing</span>
          </div>
          
          <h1 className="font-['Manrope'] text-5xl md:text-6xl font-black text-[#dce1fb] leading-[1.1] tracking-tight mb-6">
            Choose the Perfect Plan for <span className="text-[#4edea3]">Your Business</span>
          </h1>
          
          <p className="text-xl text-[#bbcabf] max-w-2xl mx-auto mb-12">
            Start with a 14-day free trial. All plans include core features like call transcription, customer CRM, and analytics. No credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="p-1 px-1 bg-[#151b2d] rounded-full inline-flex mb-16">
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`px-8 py-2 rounded-full font-bold transition-all ${billingCycle === "monthly" ? 'bg-[#4edea3] text-[#003824]' : 'text-[#bbcabf]'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle("yearly")}
              className={`px-8 py-2 rounded-full font-bold transition-all ${billingCycle === "yearly" ? 'bg-[#4edea3] text-[#003824]' : 'text-[#bbcabf]'}`}
            >
              Yearly <span className="text-[#ffba3e] text-xs ml-1">(Save 20%)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
          {pricingPlans.map((plan) => {
            const price = billingCycle === "yearly" ? Math.round(plan.price * 0.8) : plan.price;
            
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.featured
                    ? "bg-gradient-to-br from-[#4edea3] to-[#10b981] text-[#003824] scale-105 shadow-[0_20px_60px_rgba(78,222,163,0.3)]"
                    : "bg-[#151b2d] border border-[#3c4a42]/15 text-[#dce1fb]"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#ffba3e] rounded-full text-[#432c00] text-xs font-bold uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${plan.featured ? 'text-[#00422b]' : 'text-[#bbcabf]'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-['Manrope']">${price}</span>
                    <span className={`text-sm ${plan.featured ? 'text-[#00422b]/80' : 'text-[#bbcabf]'}`}>/month</span>
                  </div>
                  <p className={`mt-2 text-sm ${plan.featured ? 'text-[#00422b]/70' : 'text-[#bbcabf]'}`}>
                    {plan.callLimit}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Check 
                        size={18} 
                        className={`flex-shrink-0 mt-0.5 ${plan.featured ? 'text-[#00422b]' : 'text-[#4edea3]'}`} 
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isAuthenticated ? (
                  <Link
                    href={authenticatedAppHref}
                    className={`block text-center py-4 rounded-lg font-bold transition-all ${
                      plan.featured
                        ? "bg-[#003824] text-[#4edea3] hover:bg-[#00422b]"
                        : "bg-[#4edea3] text-[#003824] hover:bg-[#6ffbbe]"
                    }`}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className={`block text-center py-4 rounded-lg font-bold transition-all ${
                      plan.featured
                        ? "bg-[#003824] text-[#4edea3] hover:bg-[#00422b]"
                        : "bg-[#4edea3] text-[#003824] hover:bg-[#6ffbbe]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Included */}
      <section className="py-24 px-6 bg-[#151b2d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-['Manrope'] text-4xl font-bold text-[#dce1fb] mb-4">
              All plans include
            </h2>
            <p className="text-[#bbcabf] text-lg">
              Core features available on every plan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-[#191f31] border border-[#3c4a42]/10 hover:border-[#4edea3]/30 transition-all">
                <Check size={20} className="text-[#4edea3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#dce1fb]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-[#0c1324]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-['Manrope'] text-4xl font-bold text-[#dce1fb] text-center mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-[#151b2d] border border-[#3c4a42]/15 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#191f31] transition-colors">
                  <h3 className="font-['Manrope'] font-bold text-[#dce1fb]">{faq.question}</h3>
                  <span className="text-[#4edea3] transform group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-[#bbcabf] leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-[#0c1324] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4edea3 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-['Manrope'] text-5xl font-black text-[#dce1fb] mb-8 tracking-tighter">
            Ready to transform your <span className="text-[#4edea3]">customer calls?</span>
          </h2>
          <p className="text-xl text-[#bbcabf] mb-12 max-w-2xl mx-auto">
            Join thousands of small businesses leveraging the power of CallContext AI to drive growth and retention.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                href={authenticatedAppHref}
                className="px-12 py-5 bg-[#4edea3] text-[#003824] rounded-2xl font-black text-xl hover:shadow-[0_0_40px_rgba(78,222,163,0.4)] transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-12 py-5 bg-[#4edea3] text-[#003824] rounded-2xl font-black text-xl hover:shadow-[0_0_40px_rgba(78,222,163,0.4)] transition-all"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/contact"
                  className="px-12 py-5 bg-[#151b2d] text-[#dce1fb] rounded-2xl font-black text-xl border border-[#3c4a42]/20 hover:bg-[#191f31] transition-all"
                >
                  Contact Sales
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 text-sm text-[#bbcabf]">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-20 px-12 grid grid-cols-1 md:grid-cols-4 gap-12 bg-[#070d1f] border-t border-[#3c4a42]/50 font-['Inter'] text-sm text-[#dce1fb]/60">
        <div className="md:col-span-1">
          <div className="text-2xl font-black text-[#4edea3] mb-4">CallContext</div>
          <p className="max-w-xs leading-relaxed mb-8">
            Transforming the sounds of business into the signals of success.
          </p>
        </div>
        <div>
          <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Product</h5>
          <ul className="space-y-4">
            <li><Link className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="/#product">Features</Link></li>
            <li><Link className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="/pricing">Pricing</Link></li>
            <li><Link className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Resources</h5>
          <ul className="space-y-4">
            <li><a className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="#">Documentation</a></li>
            <li><a className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="#">API Reference</a></li>
            <li><a className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="#">Community</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Company</h5>
          <ul className="space-y-4">
            <li><a className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="#">Privacy Policy</a></li>
            <li><a className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="#">Terms of Service</a></li>
            {isAuthenticated ? (
              <li><Link className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href={authenticatedAppHref}>Dashboard</Link></li>
            ) : (
              <>
                <li><Link className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="/login">Login</Link></li>
                <li><Link className="text-[#dce1fb]/40 hover:text-[#4edea3] transition-colors" href="/signup">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
        <div className="md:col-span-4 pt-12 border-t border-[#3c4a42]/10 text-center">
          <p>© 2026 CallContext AI. Built for the modern web.</p>
        </div>
      </footer>
    </div>
  );
}

const pricingPlans = [
  {
    name: "Trial",
    price: 0,
    callLimit: "1,000 calls total",
    featured: false,
    cta: "Start Free Trial",
    features: [
      "14-day trial period",
      "All core features",
      "Email support",
      "1 team member",
    ],
  },
  {
    name: "Starter",
    price: 49,
    callLimit: "300 calls/month",
    featured: false,
    cta: "Choose Starter",
    features: [
      "Real-time transcription",
      "AI summaries",
      "Customer CRM",
      "Basic analytics",
      "3 team members",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: 69,
    callLimit: "1,000 calls/month",
    featured: true,
    cta: "Start Pro Trial",
    features: [
      "Everything in Starter",
      "Advanced analytics",
      "Marketing campaigns",
      "Loyalty program",
      "Automation rules",
      "5 team members",
      "Priority support",
    ],
  },
  {
    name: "Growth",
    price: 99,
    callLimit: "Unlimited calls",
    featured: false,
    cta: "Choose Growth",
    features: [
      "Everything in Pro",
      "REST API access",
      "Webhooks",
      "White-label option",
      "10 team members",
      "Dedicated success manager",
    ],
  },
];

const coreFeatures = [
  "Real-time call transcription",
  "AI-powered call summaries",
  "Customer CRM with auto-enrichment",
  "Screen pop with caller context",
  "Call history & search",
  "Order tracking",
  "Smart reminders",
  "Task management",
  "Email notifications",
  "Data export (CSV)",
  "Mobile responsive dashboard",
  "Secure cloud storage",
];

const faqs = [
  {
    question: "How does CallContext work?",
    answer: "CallContext integrates with your existing phone system (Vonage, Twilio, etc.) to automatically transcribe and analyze every call. Our AI extracts key information, updates customer profiles, and creates follow-up tasks automatically."
  },
  {
    question: "What phone systems are supported?",
    answer: "We currently support Vonage with more providers coming soon (Twilio, RingCentral, 8x8). You can also forward calls from any carrier using our universal number."
  },
  {
    question: "Can I try it for free?",
    answer: "Yes! We offer a 14-day free trial with access to all features and up to 1,000 calls. No credit card required to start."
  },
  {
    question: "How much does it cost?",
    answer: "Plans start at $49/month for 300 calls, with Pro at $69/month (1,000 calls) being our most popular. We also offer pay-per-use billing at $0.05 per minute for overflow."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade AES-256 encryption, SOC 2 compliant infrastructure, and strict access controls. Your data is never shared or sold."
  },
  {
    question: "Can I export my data?",
    answer: "Yes! You can export customers, calls, and orders to CSV anytime. We also provide a full REST API for custom integrations."
  },
  {
    question: "Do you offer API access?",
    answer: "Yes, API access and webhooks are included with Growth plan. Create API keys, configure webhooks, and build custom integrations."
  },
  {
    question: "What support do you provide?",
    answer: "All plans include email support. Pro and Growth plans get priority support. Growth plans also include a dedicated success manager and onboarding call."
  },
];
