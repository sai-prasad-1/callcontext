"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Check for error or success messages from URL params
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    if (messageParam) {
      setSuccess(decodeURIComponent(messageParam));
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-warm-800 mb-1">
        Welcome back
      </h2>
      <p className="text-sm text-warm-500 mb-6">
        Sign in to your CallContext account
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} />}
          required
        />

        <Input
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-warm-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          required
        />

        {success && (
          <div className="bg-success-50 text-success-700 text-sm px-3 py-2 rounded-md border border-success-200">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-danger-50 text-danger-700 text-sm px-3 py-2 rounded-md border border-danger-200">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-brand-500 hover:text-brand-600"
        >
          Forgot password?
        </Link>
      </div>

      <div className="mt-6 pt-6 border-t border-warm-150 text-center text-sm text-warm-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand-500 hover:text-brand-600 font-medium">
          Sign up
        </Link>
      </div>
    </div>
  );
}
