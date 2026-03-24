"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function validateSession() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        setSessionReady(true);
      } else {
        setError("Reset link is invalid or expired. Please request a new link.");
      }

      setCheckingSession(false);
    }

    validateSession();
    return () => {
      mounted = false;
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!sessionReady) {
      setError("Your reset session is not valid. Please request a new reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("auth session missing")) {
          setError("Reset link expired. Please request a new password reset link.");
        } else {
          setError(error.message);
        }
      } else {
        router.push(
          `/login?message=${encodeURIComponent(
            "Password updated successfully. Please sign in."
          )}`
        );
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-warm-800 mb-1">
        Reset your password
      </h2>
      <p className="text-sm text-warm-500 mb-6">
        Choose a new password for your account
      </p>

      {checkingSession ? (
        <p className="text-sm text-warm-500">Validating reset link...</p>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
        <Input
          type={showPassword ? "text" : "password"}
          label="New Password"
          placeholder="••••••••"
          helperText="At least 8 characters"
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

        <Input
          type={showPassword ? "text" : "password"}
          label="Confirm Password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          required
        />

        {error && (
          <div className="bg-danger-50 text-danger-700 text-sm px-3 py-2 rounded-md border border-danger-200">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Reset password
        </Button>
        </form>
      )}
    </div>
  );
}
