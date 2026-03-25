"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Store, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { US_STATES } from "@/lib/constants/us-states";

const COUNTRIES = [
  { value: "US", label: "United States", disabled: false },
  { value: "UK", label: "United Kingdom", disabled: true },
  { value: "CA", label: "Canada", disabled: true },
  { value: "AU", label: "Australia", disabled: true },
  { value: "EU", label: "European Union", disabled: true },
];

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    shopName: "",
    email: "",
    password: "",
    country: "US",
    state: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorDetails("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        if (data.details) {
          setErrorDetails(data.details);
        }
      } else {
        router.push(
          `/login?message=${encodeURIComponent(
            data.message || "Account created! Please check your email to verify."
          )}`
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-warm-800 mb-1">
        Create your account
      </h2>
      <p className="text-sm text-warm-500 mb-6">
        Start managing your calls in minutes
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          type="text"
          name="shopName"
          label="Shop Name"
          placeholder="My Flower Shop"
          value={formData.shopName}
          onChange={handleChange}
          leftIcon={<Store size={16} />}
          required
        />

        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          leftIcon={<Mail size={16} />}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            name="country"
            label="Country"
            options={COUNTRIES}
            value={formData.country}
            onChange={handleChange}
            helperText="More countries coming soon"
            disabled
            required
          />

          <Select
            name="state"
            label="State"
            placeholder="Select your state"
            options={US_STATES}
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          label="Password"
          placeholder="••••••••"
          helperText="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
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

        {error && (
          <div className="bg-danger-50 text-danger-700 text-sm px-4 py-3 rounded-md border border-danger-200">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                {errorDetails && (
                  <p className="mt-1 text-xs text-danger-600">{errorDetails}</p>
                )}
                {error.includes("Database not set up") && (
                  <div className="mt-2 p-2 bg-danger-100 rounded text-xs">
                    <p className="font-medium mb-1">Setup Required:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-danger-800">
                      <li>
                        Go to{" "}
                        <a
                          href="https://supabase.com/dashboard/project/xyzdhdcwudjjssnpabvs/sql"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          Supabase SQL Editor
                        </a>
                      </li>
                      <li>Run migrations from supabase/migrations/ folder</li>
                      <li>Try signing up again</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Create account
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-warm-150 text-center text-sm text-warm-600">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-500 hover:text-brand-600 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
