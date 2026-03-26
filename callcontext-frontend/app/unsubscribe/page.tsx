"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Phone } from "lucide-react";
import Link from "next/link";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const shopId = searchParams.get("shop");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-unsubscribe if phone and shop are in URL
    if (phone && shopId && !success && !loading) {
      handleUnsubscribe();
    }
  }, [phone, shopId]);

  async function handleUnsubscribe() {
    if (!phone || !shopId) {
      setError("Invalid unsubscribe link. Please contact support.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/sms/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, shop_id: shopId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to unsubscribe");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unsubscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] font-['Inter'] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-[#10b981]/20 rounded-xl mb-6">
            <Phone className="text-[#4edea3]" size={32} />
          </Link>
          <h1 className="font-['Manrope'] text-3xl font-bold text-[#dce1fb] mb-2">
            SMS Unsubscribe
          </h1>
          <p className="text-[#bbcabf] text-sm">
            Manage your SMS communication preferences
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#151b2d] border border-[#3c4a42]/15 rounded-2xl p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-[#4edea3]/30 border-t-[#4edea3] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#bbcabf]">Processing your request...</p>
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#10b981]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-[#4edea3]" size={32} />
              </div>
              <h2 className="font-['Manrope'] text-xl font-bold text-[#dce1fb] mb-2">
                You've been unsubscribed
              </h2>
              <p className="text-[#bbcabf] mb-6">
                You will no longer receive SMS messages from this business.
              </p>
              <div className="bg-[#191f31] border border-[#3c4a42]/10 rounded-lg p-4 text-left">
                <p className="text-xs text-[#bbcabf] mb-2">
                  <strong className="text-[#dce1fb]">Phone:</strong> {phone}
                </p>
                <p className="text-xs text-[#bbcabf]">
                  To resubscribe, please contact the business directly.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <h2 className="font-['Manrope'] text-xl font-bold text-[#dce1fb] mb-2">
                Unsubscribe Failed
              </h2>
              <p className="text-[#bbcabf] mb-6">{error}</p>
              <button
                onClick={handleUnsubscribe}
                className="px-6 py-2 bg-[#4edea3] text-[#003824] rounded-lg font-bold hover:bg-[#6ffbbe] transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#bbcabf] mb-6">
                Missing unsubscribe link. Please use the link provided in your SMS message.
              </p>
              <Link
                href="/"
                className="text-[#4edea3] font-bold hover:underline"
              >
                Return to Home
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#bbcabf]/60 mb-2">
            CallContext complies with the Telephone Consumer Protection Act (TCPA)
          </p>
          <p className="text-xs text-[#bbcabf]/60">
            Questions? Contact <a href="mailto:support@callcontext.ai" className="text-[#4edea3] hover:underline">support@callcontext.ai</a>
          </p>
        </div>
      </div>
    </div>
  );
}
