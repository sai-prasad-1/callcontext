"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Phone } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

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
                Precision Analytics for <br />
                <span className="text-[#4edea3]">High-Stakes Calls.</span>
              </h1>
              <p className="text-[#bbcabf] text-lg max-w-lg leading-relaxed">
                Experience the cinematic depth of your data. CallContext provides unparalleled insight into every conversation with real-time processing.
              </p>
            </div>

            {/* Floating Dashboard Preview Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-[#4edea3]/20 blur-2xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-[#2e3447]/40 backdrop-blur-[20px] rounded-xl border border-[#3c4a42]/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ffb4ab]/40"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffba3e]/40"></div>
                    <div className="w-3 h-3 rounded-full bg-[#4edea3]/40"></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-['Inter'] uppercase tracking-widest text-[#bbcabf]">
                    <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                    Live Context Stream
                  </div>
                </div>

                {/* Mock Data visualization */}
                <div className="space-y-4">
                  <div className="h-2 w-3/4 bg-[#2e3447] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4edea3] w-[85%]"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-[#151b2d] rounded-lg border border-[#3c4a42]/5"></div>
                    <div className="h-16 bg-[#151b2d] rounded-lg border border-[#3c4a42]/5"></div>
                    <div className="h-16 bg-[#151b2d] rounded-lg border border-[#3c4a42]/5"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1 bg-[#bbcabf]/10 w-full rounded"></div>
                    <div className="h-1 bg-[#bbcabf]/10 w-5/6 rounded"></div>
                    <div className="h-1 bg-[#bbcabf]/10 w-4/6 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex items-center gap-6">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#10b981]/20 border-2 border-[#0c1324] flex items-center justify-center text-xs font-bold text-[#4edea3]">
                  2K+
                </div>
              </div>
              <p className="text-[#bbcabf] text-sm font-medium">Trusted by 2,000+ businesses globally</p>
            </div>
          </div>
        </section>

        {/* Right Section: Auth Form */}
        <section className="w-full lg:w-1/2 bg-[#070d1f] flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            {/* Branding */}
            <div className="mb-12">
              <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-[#10b981]/20 rounded-xl mb-6">
                {isLogin ? (
                  <Shield className="text-[#4edea3]" size={24} />
                ) : (
                  <Phone className="text-[#4edea3]" size={24} />
                )}
              </Link>
              <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-tighter text-[#dce1fb] mb-2">
                {isLogin ? "Secure Access" : "Create Account"}
              </h2>
              <p className="text-[#bbcabf] text-sm">
                {isLogin
                  ? "Enter your credentials to access the platform."
                  : "Start your journey with CallContext today."}
              </p>
            </div>

            {/* Form Content (from pages) */}
            <div className="[&_input]:bg-[#151b2d] [&_input]:border-[#3c4a42]/15 [&_input]:text-[#dce1fb] [&_input]:placeholder:text-[#a7bdb4]/30 [&_input]:focus:ring-[#4edea3]/40 [&_input]:focus:border-[#4edea3]/40 [&_select]:bg-[#151b2d] [&_select]:border-[#3c4a42]/15 [&_select]:text-[#dce1fb] [&_select]:focus:ring-[#4edea3]/40 [&_select]:focus:border-[#4edea3]/40 [&_label]:text-[#bbcabf] [&_button[type=submit]]:bg-gradient-to-br [&_button[type=submit]]:from-[#4edea3] [&_button[type=submit]]:to-[#10b981] [&_button[type=submit]]:text-[#003824] [&_button[type=submit]]:shadow-[0_10px_30px_rgba(78,222,163,0.2)] [&_button[type=submit]]:hover:scale-[1.02] [&_a]:text-[#4edea3] [&_a]:hover:text-[#6ffbbe]">
              {children}
            </div>

            {/* Security Badge */}
            <div className="mt-8 flex items-center justify-center gap-4 py-4 px-6 rounded-full bg-[#151b2d]/50 border border-[#3c4a42]/5">
              <Shield className="text-[#4edea3]/60" size={16} />
              <span className="text-[0.625rem] font-['Inter'] uppercase tracking-widest text-[#bbcabf]/60">
                AES-256 Cloud Security Infrastructure
              </span>
            </div>
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
          <Link href="/contact" className="text-[0.625rem] font-['Inter'] uppercase tracking-widest text-[#bbcabf]/40 hover:text-[#4edea3] transition-colors">
            Contact
          </Link>
          <a href="#" className="text-[0.625rem] font-['Inter'] uppercase tracking-widest text-[#bbcabf]/40 hover:text-[#4edea3] transition-colors">
            Security
          </a>
        </div>
      </footer>
    </div>
  );
}

