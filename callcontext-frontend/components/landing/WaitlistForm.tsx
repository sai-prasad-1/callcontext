"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant / Food Service" },
  { value: "retail", label: "Retail Store" },
  { value: "salon", label: "Salon / Spa" },
  { value: "service", label: "Service Business" },
  { value: "healthcare", label: "Healthcare / Clinic" },
  { value: "automotive", label: "Automotive" },
  { value: "other", label: "Other" },
];

export function WaitlistForm() {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    businessName: "",
    businessType: "",
    referralSource: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [position, setPosition] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          business_name: formData.businessName,
          business_type: formData.businessType,
          referral_source: formData.referralSource,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setStatus("success");
      setPosition(data.position);
      
      // Reset form
      setFormData({
        email: "",
        fullName: "",
        phone: "",
        businessName: "",
        businessType: "",
        referralSource: "",
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl bg-[#ecfdf5] p-8 text-center">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-500">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h3 className="mb-3 font-display text-2xl font-semibold text-warm-900">
          You're on the list!
        </h3>
        <p className="mb-6 text-warm-700">
          {position && (
            <>
              You&apos;re <span className="font-semibold text-warm-900">#{position}</span> on our
              waitlist.{" "}
            </>
          )}
          We&apos;ll email you when early access opens.
        </p>
        <div className="rounded-lg bg-[#f6f3ef] p-4">
          <p className="text-sm text-[#00694e]">
            <span className="font-semibold">Founding offer:</span> early-access accounts receive
            launch pricing for the first 6 months.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-white p-6 sm:p-8"
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
          required
        />
        <Input
          type="email"
          label="Email"
          placeholder="john@business.com"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          type="tel"
          label="Phone Number"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
        />
        <Input
          type="text"
          label="Business Name"
          placeholder="Acme Coffee Shop"
          value={formData.businessName}
          onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
        />
        <Select
          label="Business Type"
          options={BUSINESS_TYPES}
          value={formData.businessType}
          onChange={(e) => setFormData((prev) => ({ ...prev, businessType: e.target.value }))}
          placeholder="Select your business type"
        />
        <Input
          type="text"
          label="How did you hear about us?"
          placeholder="Google, friend, social media..."
          value={formData.referralSource}
          onChange={(e) => setFormData((prev) => ({ ...prev, referralSource: e.target.value }))}
        />
      </div>

      {status === "error" && (
        <div className="mb-6 flex items-start gap-3 rounded-md bg-danger-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" />
          <p className="text-sm text-danger-700">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={status === "loading"}
        disabled={status === "loading"}
        className="w-full"
      >
        {status === "loading" ? "Joining..." : "Join waitlist"}
      </Button>

      <p className="mt-5 text-center text-xs text-[#6e7a73]">
        By joining, you agree to receive product updates from CallContext. Unsubscribe anytime.
      </p>
    </form>
  );
}
