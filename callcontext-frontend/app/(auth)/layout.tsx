export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-brand-500 mb-2">
            CallContext
          </h1>
          <p className="text-sm text-warm-500">
            Call Intelligence CRM for Small Businesses
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-xl shadow-md border border-warm-200 p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-warm-400 mt-8">
          © {new Date().getFullYear()} CallContext. All rights reserved.
        </p>
      </div>
    </div>
  );
}
