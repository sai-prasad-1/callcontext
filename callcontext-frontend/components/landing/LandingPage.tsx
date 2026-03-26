"use client";

import {
  Phone,
  Sparkles,
  ArrowRight,
  Check,
  User,
  Zap,
  Mic,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  Flower2,
  Cake,
  Scissors,
  Car,
  Heart,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

type LandingPageProps = {
  isAuthenticated?: boolean;
  authenticatedAppHref?: string;
};

export default function LandingPage({
  isAuthenticated = false,
  authenticatedAppHref = "/dashboard",
}: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#061612] text-[#d4e7e0] font-['DM_Sans'] selection:bg-[#7bd8b4] selection:text-[#003828]">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 rounded-full mt-4 mx-auto max-w-7xl border border-[#3e4944]/20 bg-[#061612]/60 backdrop-blur-xl shadow-[0px_20px_40px_rgba(123,216,180,0.04)] font-['Outfit'] font-medium tracking-tight text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#7bd8b4] tracking-tighter">CallContext</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a className="text-[#7bd8b4] font-semibold border-b-2 border-[#7bd8b4] pb-1" href="#product">Product</a>
          <Link href="/pricing" className="text-[#d4e7e0]/70 hover:text-[#d4e7e0] transition-colors">Pricing</Link>
          <a className="text-[#d4e7e0]/70 hover:text-[#d4e7e0] transition-colors" href="#faq">FAQ</a>
          <a className="text-[#d4e7e0]/70 hover:text-[#d4e7e0] transition-colors" href="#company">Company</a>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              href={authenticatedAppHref}
              className="bg-[#7bd8b4] hover:bg-[#42a180] text-[#003828] px-5 py-2 rounded-full font-bold transition-all duration-300 scale-100 active:scale-95"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[#d4e7e0]/70 hover:text-[#d4e7e0] transition-colors">Sign in</Link>
              <Link href="/signup" className="bg-[#7bd8b4] hover:bg-[#42a180] text-[#003828] px-5 py-2 rounded-full font-bold transition-all duration-300 scale-100 active:scale-95">
                Start free trial
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d2d29] border border-[#3e4944]/10">
              <span className="w-2 h-2 rounded-full bg-[#ffba3e] animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-widest text-[#ffba3e]">Live Beta Access</span>
            </div>
            <h1 className="font-['Outfit'] text-5xl md:text-7xl font-black text-[#d4e7e0] leading-[1.1] tracking-tight">
              AI Call Intelligence for <span className="text-[#7bd8b4]">Small Businesses</span>
            </h1>
            <p className="text-xl text-[#bdc9c2] max-w-xl leading-relaxed">
              Stop losing customers you can't remember. CallContext listens, remembers, and organizes every customer request automatically.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  href={authenticatedAppHref}
                  className="px-8 py-4 bg-[#7bd8b4] text-[#003828] rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(123,216,180,0.3)] transition-all inline-flex items-center gap-2"
                >
                  Open Dashboard
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="px-8 py-4 bg-[#7bd8b4] text-[#003828] rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(123,216,180,0.3)] transition-all">
                    Get Started Free
                  </Link>
                  <button className="px-8 py-4 border border-[#3e4944] text-[#d4e7e0] rounded-xl font-bold text-lg hover:bg-[#0f1e1a] transition-all">
                    Watch Demo
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Live Call Mockup */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-[#7bd8b4]/10 rounded-[2rem] blur-3xl group-hover:bg-[#7bd8b4]/20 transition-all duration-700"></div>
            <div className="relative bg-[#0f1e1a] border border-[#3e4944]/20 rounded-2xl shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
              <div className="p-4 bg-[#13231e] flex items-center justify-between border-b border-[#3e4944]/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="font-mono text-xs text-[#bdc9c2] uppercase tracking-widest">Active Transcription — 02:41</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#3e4944]/30"></div>
                  <div className="w-2 h-2 rounded-full bg-[#3e4944]/30"></div>
                  <div className="w-2 h-2 rounded-full bg-[#3e4944]/30"></div>
                </div>
              </div>
              <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                {/* Caller */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#e09b00] flex items-center justify-center text-[#432c00] flex-shrink-0">
                    <User size={16} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[#ffba3e] uppercase tracking-tighter">Customer (Sarah)</span>
                    <div className="bg-[#283833]/40 p-4 rounded-2xl rounded-tl-none text-[#bdc9c2] text-sm leading-relaxed">
                      "Hi, I was looking to book a floral arrangement for a wedding next Saturday. Do you have white lilies in stock?"
                    </div>
                  </div>
                </div>
                {/* AI Insights */}
                <div className="flex gap-4 justify-end">
                  <div className="space-y-2 text-right">
                    <span className="text-[10px] font-mono text-[#7bd8b4] uppercase tracking-tighter">CallContext AI</span>
                    <div className="bg-[#7bd8b4]/10 border border-[#7bd8b4]/20 p-4 rounded-2xl rounded-tr-none text-[#7bd8b4] text-sm leading-relaxed">
                      <div className="flex items-center gap-2 mb-2 justify-end">
                        <span className="font-bold">Intent: Booking Inquiry</span>
                        <Sparkles size={14} />
                      </div>
                      Sarah is asking for white lilies for a wedding on Oct 14th. Checking inventory...
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#7bd8b4] flex items-center justify-center text-[#003828] flex-shrink-0">
                    <Zap size={16} />
                  </div>
                </div>
                {/* Action */}
                <div className="pt-4 opacity-60">
                  <div className="h-px bg-[#3e4944]/20 w-full mb-6"></div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#1d2d29] flex items-center justify-center text-[#bdc9c2] flex-shrink-0">
                      <User size={16} />
                    </div>
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-[#1d2d29] rounded-full w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-[#1d2d29] rounded-full w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Bar */}
      <div className="w-full bg-[#03110d] py-12 border-y border-[#3e4944]/5">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-mono uppercase tracking-[0.3em] text-[#bdc9c2]/40 mb-10">Trusted by over 2,000 local business owners</p>
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="font-['Outfit'] font-bold text-2xl tracking-tighter">PetVibe</span>
            <span className="font-['Outfit'] font-bold text-2xl tracking-tighter">BloomBox</span>
            <span className="font-['Outfit'] font-bold text-2xl tracking-tighter">AutoSync</span>
            <span className="font-['Outfit'] font-bold text-2xl tracking-tighter">UrbanCuts</span>
            <span className="font-['Outfit'] font-bold text-2xl tracking-tighter">BakerDaily</span>
          </div>
        </div>
      </div>

      {/* Micro-Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`p-8 bg-[#0f1e1a] rounded-2xl border-l-4 ${index % 2 === 0 ? 'border-[#7bd8b4]' : 'border-[#ffba3e]'}`}>
              <p className="text-[#bdc9c2] italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1d2d29] flex items-center justify-center">
                  <User size={20} className="text-[#7bd8b4]" />
                </div>
                <div>
                  <p className="font-bold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-[#ffba3e]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Industry Cards */}
      <section className="py-24 px-6 bg-[#2c3c38] text-[#061612] relative">
        <div className="absolute inset-0 bg-[#7bd8b4]/5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="font-['Outfit'] text-4xl font-bold text-[#061612] mb-4">Built for Every Street</h2>
            <p className="text-[#1d2d29]">Our AI models are pre-trained on your specific industry terminology and workflow.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {industries.map((industry, index) => (
              <div key={index} className="aspect-square bg-white p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <industry.icon className="text-[#7bd8b4] w-8 h-8" />
                <span className="font-bold text-sm text-[#061612]">{industry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="product" className="py-32 px-6 bg-white text-[#061612]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="font-['Outfit'] text-5xl font-black mb-6 max-w-xl">Superpowers for your phone lines.</h2>
            <p className="text-[#1d2d29] text-lg max-w-2xl">CallContext integrates seamlessly with your existing hardware and VOIP systems to turn voices into data.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`p-10 rounded-[2rem] space-y-6 ${index % 2 === 0 ? 'bg-[#03110d] text-white' : 'bg-[#0f1e1a] border border-[#3e4944]/10 text-[#d4e7e0]'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${index % 2 === 0 ? 'bg-[#7bd8b4] text-[#003828]' : 'bg-[#ffba3e] text-[#432c00]'}`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className={`leading-relaxed ${index % 2 === 0 ? 'text-[#bdc9c2]' : 'text-[#1d2d29]'}`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 bg-[#03110d] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-[#7bd8b4]/5 blur-[120px] rounded-full translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="font-['Outfit'] text-5xl font-black mb-4">Three Steps to Intelligence</h2>
            <p className="text-[#bdc9c2]">Setup takes minutes. The benefits last forever.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-16">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <span className="text-[12rem] font-black text-[#3e4944]/10 absolute -top-24 -left-8 leading-none">{index + 1}</span>
                <div className="space-y-6 pt-12">
                  <h4 className="text-2xl font-bold text-[#7bd8b4]">{step.title}</h4>
                  <p className="text-[#bdc9c2]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-32 px-6 bg-white text-[#061612]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-['Outfit'] text-5xl font-black mb-8">Ready to hear what you've been missing?</h2>
          <div className="p-1 px-1 bg-[#0f1e1a] rounded-full inline-flex mb-12">
            <button 
              onClick={() => setActiveTab("monthly")}
              className={`px-8 py-2 rounded-full font-bold shadow-sm transition-all ${activeTab === "monthly" ? 'bg-white' : 'text-[#1d2d29]'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setActiveTab("yearly")}
              className={`px-8 py-2 rounded-full font-bold transition-all ${activeTab === "yearly" ? 'bg-white' : 'text-[#1d2d29]'}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
          <div className="bg-[#061612] p-12 rounded-[3rem] text-[#d4e7e0] text-left grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">The Business Plan</h3>
              <p className="text-[#bdc9c2]">Everything you need to automate your customer intelligence.</p>
              <ul className="space-y-4">
                {pricingFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="text-[#7bd8b4]" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center md:text-right">
              <div className="mb-4">
                <span className="text-6xl font-black font-['Outfit'] text-[#7bd8b4]">${activeTab === "monthly" ? "49" : "39"}</span>
                <span className="text-[#bdc9c2]">/month</span>
              </div>
              <p className="text-[#ffba3e] text-sm font-mono mb-8 uppercase tracking-widest">Risk-free 14-day trial</p>
              {isAuthenticated ? (
                <Link
                  href={authenticatedAppHref}
                  className="w-full block py-4 bg-[#7bd8b4] text-[#003828] rounded-2xl font-bold text-xl hover:scale-105 transition-transform text-center"
                >
                  Open Dashboard
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="w-full block py-4 bg-[#7bd8b4] text-[#003828] rounded-2xl font-bold text-xl hover:scale-105 transition-transform text-center"
                >
                  Start Free Trial Now
                </Link>
              )}
            </div>
          </div>
          <div className="mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7bd8b4] hover:gap-3 transition-all"
            >
              View detailed pricing comparison
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 bg-[#061612] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #7bd8b4 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-['Outfit'] text-6xl font-black text-[#d4e7e0] mb-8 tracking-tighter">
            Your business is speaking. <br /><span className="text-[#7bd8b4]">Are you listening?</span>
          </h2>
          <p className="text-xl text-[#bdc9c2] mb-12 max-w-2xl mx-auto">
            Join thousands of small businesses leveraging the power of CallContext AI to drive growth and retention.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                href={authenticatedAppHref}
                className="px-12 py-5 bg-[#7bd8b4] text-[#003828] rounded-2xl font-black text-xl hover:shadow-[0_0_40px_rgba(123,216,180,0.4)] transition-all"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-12 py-5 bg-[#7bd8b4] text-[#003828] rounded-2xl font-black text-xl hover:shadow-[0_0_40px_rgba(123,216,180,0.4)] transition-all"
                >
                  Get Started Today
                </Link>
                <button className="px-12 py-5 bg-[#1d2d29] text-[#d4e7e0] rounded-2xl font-black text-xl border border-[#3e4944]/20 hover:bg-[#2c3c38] transition-all">
                  Book a Demo
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="company" className="w-full py-20 px-12 grid grid-cols-1 md:grid-cols-4 gap-12 bg-[#061612] border-t border-[#3e4944]/50 font-['DM_Sans'] text-sm text-[#d4e7e0]/60">
        <div className="md:col-span-1">
          <div className="text-2xl font-black text-[#7bd8b4] mb-4">CallContext</div>
          <p className="max-w-xs leading-relaxed mb-8">
            Transforming the sounds of business into the signals of success. The first AI CRM built for the real world.
          </p>
        </div>
        <div>
          <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Product</h5>
          <ul className="space-y-4">
            <li><a className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="#product">Features</a></li>
            <li><Link className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="/pricing">Pricing</Link></li>
            <li><a className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="#faq">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Resources</h5>
          <ul className="space-y-4">
            <li><a className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="#">Documentation</a></li>
            <li><a className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="#">API Reference</a></li>
            <li><a className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="#">Community</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Company</h5>
          <ul className="space-y-4">
            <li><a className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="#">Privacy Policy</a></li>
            <li><a className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="#">Terms of Service</a></li>
            {isAuthenticated ? (
              <li><Link className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href={authenticatedAppHref}>Dashboard</Link></li>
            ) : (
              <>
                <li><Link className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="/login">Login</Link></li>
                <li><Link className="text-[#d4e7e0]/40 hover:text-[#7bd8b4] transition-colors" href="/signup">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
        <div className="md:col-span-4 pt-12 border-t border-[#3e4944]/10 text-center">
          <p>© 2026 CallContext AI. Built for the modern web.</p>
        </div>
      </footer>
    </div>
  );
}

const testimonials = [
  {
    name: "Elena Rodriguez",
    role: "Salon Owner",
    quote: "I haven't missed a single callback since installing CallContext. It's like having a receptionist who never sleeps."
  },
  {
    name: "Marcus Chen",
    role: "Auto Shop Lead",
    quote: "Finally, an AI tool that actually understands what my customers want. The auto-summaries are incredibly accurate."
  },
  {
    name: "Sarah Jenkins",
    role: "Bakery Owner",
    quote: "The setup took five minutes. Now I get a text after every call telling me exactly what I need to do next."
  }
];

const industries = [
  { name: "Florists", icon: Flower2 },
  { name: "Bakeries", icon: Cake },
  { name: "Salons", icon: Scissors },
  { name: "Auto Shops", icon: Car },
  { name: "Vet Clinics", icon: Heart },
  { name: "Restaurants", icon: UtensilsCrossed },
];

const features = [
  {
    icon: Mic,
    title: "Live Transcription",
    description: "Watch calls turn into text in real-time. Never scramble for a pen and paper during a busy rush again."
  },
  {
    icon: FileText,
    title: "Auto-Summaries",
    description: "Get a 3-sentence summary of every call delivered via SMS or Slack within seconds of hanging up."
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Our AI detects appointment requests and cross-references your calendar automatically."
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description: "Identify why customers are calling. Is it pricing? Hours? Inventory? See the data visualized."
  },
  {
    icon: Users,
    title: "Customer History",
    description: "Instantly see every past interaction when a customer calls back. Make them feel like a VIP."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Enterprise-grade encryption and HIPAA compliance. Your data and your customers stay protected."
  },
];

const steps = [
  {
    title: "Connect Lines",
    description: "Sync your existing phone numbers or VOIP provider with a single click. No new hardware needed."
  },
  {
    title: "AI Learns",
    description: "Upload your service list or menu. Our AI trains on your specific business rules in under 60 seconds."
  },
  {
    title: "Get Insights",
    description: "Start receiving rich transcripts, summaries, and action items for every incoming and outgoing call."
  },
];

const pricingFeatures = [
  "Unlimited Live Transcriptions",
  "AI Post-Call Summaries",
  "CRM Integration (HubSpot, Salesforce)",
  "Priority Email Support",
];
