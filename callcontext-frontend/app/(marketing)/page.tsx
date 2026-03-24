import { Phone, Zap, TrendingUp, Shield, Brain, Clock, CheckCircle2, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { WaitlistForm } from './WaitlistForm';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 animate-[slideInTop_400ms_cubic-bezier(0.34,1.56,0.64,1)]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-teal-100/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent font-display">
                  CallContext
                </span>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-slate-700 hover:text-teal-700 transition-colors duration-200 font-medium">
                  Features
                </a>
                <a href="#how-it-works" className="text-slate-700 hover:text-teal-700 transition-colors duration-200 font-medium">
                  How It Works
                </a>
                <a href="#pricing" className="text-slate-700 hover:text-teal-700 transition-colors duration-200 font-medium">
                  Pricing
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  href="/login"
                  className="hidden sm:block text-teal-700 hover:text-teal-800 font-semibold transition-colors duration-200"
                >
                  Sign In
                </Link>
                <a 
                  href="#waitlist"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-blue-500/30 cursor-pointer"
                >
                  Join Waitlist
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8 animate-[fadeInUp_600ms_ease-out]">
              <div className="inline-flex items-center gap-2 bg-teal-100/80 backdrop-blur-sm text-teal-800 px-4 py-2 rounded-full text-sm font-semibold border border-teal-200/50">
                <Zap className="w-4 h-4" />
                AI-Powered Call Intelligence
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight font-display">
                Never Miss a
                <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Business Call Again
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                Real-time call intelligence for small businesses. Automatically capture customer details, 
                track orders, and build relationships—all while you focus on what matters.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                  href="#waitlist"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-xl shadow-blue-500/30 cursor-pointer text-lg"
                >
                  Get Early Access
                  <ArrowRight className="w-5 h-5" />
                </a>
                <Link 
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-xl font-semibold hover:bg-teal-50 transition-all duration-200 shadow-lg border-2 border-teal-200 text-lg"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">500+</span> businesses on waitlist
                  </p>
                </div>
                <div className="h-12 w-px bg-slate-300" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">10x</p>
                  <p className="text-sm text-slate-600">Faster call logging</p>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image/Visual */}
            <div className="relative animate-[fadeInUp_800ms_ease-out]">
              <div className="relative bg-gradient-to-br from-teal-600 to-cyan-700 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  {/* Mock Dashboard UI */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Incoming Call</p>
                        <p className="text-sm text-slate-600">(555) 123-4567</p>
                      </div>
                      <div className="ml-auto">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-slate-600">Live</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-teal-700" />
                          <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">AI Detected</p>
                        </div>
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Customer:</span> Sarah Martinez
                        </p>
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Intent:</span> Order inquiry
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-700" />
                          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Last Contact</p>
                        </div>
                        <p className="text-sm text-slate-700">Ordered 2 weeks ago • Spent $127</p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-700" />
                          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Suggested Action</p>
                        </div>
                        <p className="text-sm text-slate-700">Offer 10% discount on next order</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute -right-4 -bottom-4 bg-white rounded-2xl p-4 shadow-xl border-2 border-teal-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Revenue Growth</p>
                      <p className="text-lg font-bold text-slate-900">+34%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 font-display">
              Everything you need to
              <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                grow your business
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real-time AI analyzes every call, captures details automatically, and helps you build stronger customer relationships.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-white to-teal-50/30 rounded-2xl p-8 border-2 border-teal-100/50 hover:border-teal-300 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 font-display">
              Set up in minutes,
              <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                profit for years
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-4 font-display">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-teal-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 font-display">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Start free, upgrade as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.featured 
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-2xl scale-105 border-4 border-cyan-400' 
                    : 'bg-white border-2 border-teal-100 hover:border-teal-300 shadow-lg'
                } transition-all duration-300 cursor-pointer hover:shadow-xl`}
              >
                {plan.featured && (
                  <div className="bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 font-display ${plan.featured ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.featured ? 'text-white' : 'text-slate-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={plan.featured ? 'text-cyan-100' : 'text-slate-600'}>
                    /month
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.featured ? 'text-cyan-200' : 'text-teal-600'}`} />
                      <span className={plan.featured ? 'text-cyan-50' : 'text-slate-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/signup"
                  className={`block text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    plan.featured
                      ? 'bg-white text-blue-600 hover:bg-cyan-50'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm text-teal-300 px-4 py-2 rounded-full text-sm font-semibold border border-teal-400/30 mb-6">
              <Zap className="w-4 h-4" />
              Early Access Program
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-display">
              Be first to transform
              <span className="block bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                your customer calls
              </span>
            </h2>
            <p className="text-xl text-slate-300">
              Join 500+ businesses on our waitlist. Get exclusive early access and special founding member pricing.
            </p>
          </div>

          <WaitlistForm />

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-white mb-2">500+</p>
              <p className="text-slate-400 text-sm">On Waitlist</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-2">50%</p>
              <p className="text-slate-400 text-sm">Launch Discount</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-2">30 Days</p>
              <p className="text-slate-400 text-sm">Free Trial</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold font-display">CallContext</span>
              </div>
              <p className="text-slate-400 text-sm">
                Real-time call intelligence for small businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-teal-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-teal-400 transition-colors">Pricing</a></li>
                <li><Link href="/login" className="hover:text-teal-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 CallContext. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Brain,
    title: "AI Call Analysis",
    description: "Real-time transcription and analysis captures customer details, intent, and sentiment automatically.",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    icon: Phone,
    title: "Smart Caller ID",
    description: "Instantly recognize returning customers with complete history, preferences, and past orders at your fingertips.",
    gradient: "from-blue-500 to-cyan-600"
  },
  {
    icon: TrendingUp,
    title: "Sales Insights",
    description: "Track trends, identify opportunities, and optimize your sales process with actionable analytics.",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    icon: Clock,
    title: "Auto Follow-ups",
    description: "Never forget a callback. Smart reminders and automated follow-ups keep customers engaged.",
    gradient: "from-orange-500 to-amber-600"
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Two-party consent, encrypted storage, and GDPR compliance built-in. Your customers' trust is protected.",
    gradient: "from-teal-500 to-cyan-600"
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Forward your business line and you're live in 5 minutes. No hardware, no complex installation.",
    gradient: "from-indigo-500 to-purple-600"
  }
];

const steps = [
  {
    title: "Forward Your Number",
    description: "Forward your business line to your CallContext number. Takes 2 minutes, no technical skills needed."
  },
  {
    title: "AI Starts Learning",
    description: "Our AI analyzes every call in real-time, capturing names, orders, and customer intent automatically."
  },
  {
    title: "Grow Your Business",
    description: "Access insights, automate follow-ups, and build stronger relationships. Watch revenue grow."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: 49,
    featured: false,
    cta: "Start Free Trial",
    features: [
      "100 calls per month",
      "Real-time transcription",
      "Basic CRM",
      "Email support",
      "7-day call history"
    ]
  },
  {
    name: "Pro",
    price: 149,
    featured: true,
    cta: "Start Free Trial",
    features: [
      "500 calls per month",
      "Advanced AI insights",
      "Full CRM with reminders",
      "Priority support",
      "90-day call history",
      "Custom integrations",
      "Marketing campaigns"
    ]
  },
  {
    name: "Growth",
    price: 299,
    featured: false,
    cta: "Start Free Trial",
    features: [
      "Unlimited calls",
      "Multi-location support",
      "Team collaboration",
      "Dedicated account manager",
      "Unlimited history",
      "White-label options",
      "API access"
    ]
  }
];
