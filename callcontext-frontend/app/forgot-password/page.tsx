"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
      });

      if (error) {
        if (
          error.status === 429 ||
          error.code === "over_email_send_rate_limit"
        ) {
          setError("Too many reset requests. Please wait a minute and try again.");
        } else {
          setError(error.message);
        }
      } else {
        setSent(true);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-success-500" />
        </div>
        <h2 className="text-2xl font-semibold text-warm-800 mb-2">
          Check your email
        </h2>
        <p className="text-sm text-warm-500 mb-6">
          We&apos;ve sent a password reset link to <strong>{email}</strong>. If
          you don&apos;t see it, check spam and try again in 60 seconds.
        </p>
        <Link href="/login">
          <Button variant="secondary" className="w-full">
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 mb-6"
      >
        <ArrowLeft size={16} />
        Back to login
      </Link>

      <h2 className="text-2xl font-semibold text-warm-800 mb-1">
        Forgot password?
      </h2>
      <p className="text-sm text-warm-500 mb-6">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleReset} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} />}
          required
        />

        {error && (
          <div className="bg-danger-50 text-danger-700 text-sm px-3 py-2 rounded-md border border-danger-200">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Send reset link
        </Button>
      </form>
    </div>
  );
}
