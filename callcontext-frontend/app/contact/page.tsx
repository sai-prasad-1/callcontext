"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#0c1324] font-['Inter'] text-[#dce1fb] antialiased">
      <main className="flex min-h-screen">
        {/* Left Section: Cinematic Brand Visual */}
        <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0c1324]">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#4edea3]/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#ffba3e]/5 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative z-10 w-full flex flex-col justify-center px-16 xl:px-24">
            <div className="mb-12">
              <h1 className="font-['Manrope'] text-5xl font-extrabold tracking-tighter text-[#dce1fb] leading-tight mb-6">
                Let's Build Something <br />
                <span className="text-[#4edea3]">Extraordinary.</span>
              </h1>
              <p className="text-[#bbcabf] text-lg max-w-lg leading-relaxed">
                Our team of call intelligence experts is ready to help you transform your customer conversations into actionable insights.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-[#4edea3]/20 blur-2xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-[#2e3447]/40 backdrop-blur-[20px] rounded-xl border border-[#3c4a42]/10 p-6 shadow-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#10b981]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <info.icon className="text-[#4edea3]" size={24} />
                      </div>
                      <div>
                        <h3 className="font-['Manrope'] font-bold text-[#dce1fb] mb-1">{info.title}</h3>
                        <p className="text-[#bbcabf] text-sm">{info.value}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex items-center gap-6">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#0c1324] bg-[#2e3447] flex items-center justify-center text-xs font-bold text-[#4edea3]">
                  2K+
                </div>
              </div>
              <p className="text-[#bbcabf] text-sm font-medium">Trusted by 2,000+ businesses globally</p>
            </div>
          </div>
        </section>

        {/* Right Section: Contact Form */}
        <section className="w-full lg:w-1/2 bg-[#070d1f] flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            {/* Branding */}
            <div className="mb-12">
              <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-[#10b981]/20 rounded-xl mb-6">
                <Mail className="text-[#4edea3]" size={24} />
              </Link>
              <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-tighter text-[#dce1fb] mb-2">
                Get in Touch
              </h2>
              <p className="text-[#bbcabf] text-sm">Fill out the form below and we'll respond within 24 hours.</p>
            </div>

            {!submitted ? (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#bbcabf]" htmlFor="name">
                      Full Name
                    </label>
                    <div className="relative group">
                      <input
                        className="w-full bg-[#151b2d] border border-[#3c4a42]/15 text-[#dce1fb] text-sm rounded-lg px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#4edea3]/40 focus:border-[#4edea3]/40 transition-all placeholder:text-[#a7bdb4]/30"
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#bbcabf]" htmlFor="email">
                      Email Address
                    </label>
                    <div className="relative group">
                      <input
                        className="w-full bg-[#151b2d] border border-[#3c4a42]/15 text-[#dce1fb] text-sm rounded-lg px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#4edea3]/40 focus:border-[#4edea3]/40 transition-all placeholder:text-[#a7bdb4]/30"
                        id="email"
                        name="email"
                        placeholder="john@company.com"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#bbcabf]" htmlFor="company">
                        Company
                      </label>
                      <input
                        className="w-full bg-[#151b2d] border border-[#3c4a42]/15 text-[#dce1fb] text-sm rounded-lg px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#4edea3]/40 focus:border-[#4edea3]/40 transition-all placeholder:text-[#a7bdb4]/30"
                        id="company"
                        name="company"
                        placeholder="Acme Inc"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#bbcabf]" htmlFor="phone">
                        Phone
                      </label>
                      <input
                        className="w-full bg-[#151b2d] border border-[#3c4a42]/15 text-[#dce1fb] text-sm rounded-lg px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#4edea3]/40 focus:border-[#4edea3]/40 transition-all placeholder:text-[#a7bdb4]/30"
                        id="phone"
                        name="phone"
                        placeholder="(555) 000-0000"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#bbcabf]" htmlFor="subject">
                      Subject
                    </label>
                    <select
                      className="w-full bg-[#151b2d] border border-[#3c4a42]/15 text-[#dce1fb] text-sm rounded-lg px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#4edea3]/40 focus:border-[#4edea3]/40 transition-all"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="">Select a topic</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="demo">Request Demo</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#bbcabf]" htmlFor="message">
                      Message
                    </label>
                    <textarea
                      className="w-full bg-[#151b2d] border border-[#3c4a42]/15 text-[#dce1fb] text-sm rounded-lg px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#4edea3]/40 focus:border-[#4edea3]/40 transition-all placeholder:text-[#a7bdb4]/30 resize-none"
                      id="message"
                      name="message"
                      placeholder="Tell us about your project..."
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      className="w-full bg-gradient-to-br from-[#4edea3] to-[#10b981] text-[#003824] font-['Manrope'] font-bold py-4 rounded-lg shadow-[0_10px_30px_rgba(78,222,163,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#003824]/30 border-t-[#003824] rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Security Badge */}
                <div className="mt-8 flex items-center justify-center gap-4 py-4 px-6 rounded-full bg-[#151b2d]/50 border border-[#3c4a42]/5">
                  <CheckCircle className="text-[#4edea3]/60" size={16} />
                  <span className="text-[0.625rem] font-['Inter'] uppercase tracking-widest text-[#bbcabf]/60">
                    Your data is protected with AES-256 encryption
                  </span>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#10b981]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-[#4edea3]" size={40} />
                </div>
                <h3 className="font-['Manrope'] text-2xl font-bold text-[#dce1fb] mb-4">Message Sent!</h3>
                <p className="text-[#bbcabf] mb-8">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#4edea3] font-bold hover:underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full px-8 flex justify-between items-center pointer-events-none">
        <div className="text-[0.625rem] font-['Inter'] uppercase tracking-widest text-[#bbcabf]/40 flex items-center gap-4">
          <span>© 2026 CallContext</span>
          <div className="w-1 h-1 rounded-full bg-[#3c4a42]/20"></div>
          <span>v4.2.0-stable</span>
        </div>
        <div className="flex gap-6 pointer-events-auto">
          <Link href="/" className="text-[0.625rem] font-['Inter'] uppercase tracking-widest text-[#bbcabf]/40 hover:text-[#4edea3] transition-colors">
            Home
          </Link>
          <Link href="/pricing" className="text-[0.625rem] font-['Inter'] uppercase tracking-widest text-[#bbcabf]/40 hover:text-[#4edea3] transition-colors">
            Pricing
          </Link>
        </div>
      </footer>
    </div>
  );
}

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "support@callcontext.ai",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "123 Tech Street, San Francisco, CA 94105",
  },
];
