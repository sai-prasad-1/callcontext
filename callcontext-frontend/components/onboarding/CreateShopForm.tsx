"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { US_STATES } from "@/lib/constants/us-states";

export function CreateShopForm(props: { userEmail: string | null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    shopName: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorDetails("");
    setLoading(true);

    try {
      const res = await fetch("/api/shop/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: formData.shopName,
          state: formData.state,
          country: "US",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not create shop");
        if (data.details) setErrorDetails(data.details);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3">
          <Store size={24} />
        </div>
        <h2 className="font-display text-xl font-semibold text-warm-900">
          Create your shop
        </h2>
        <p className="text-sm text-warm-600 mt-2">
          Your account is ready. Add a shop profile to open the dashboard
          {props.userEmail ? (
            <>
              {" "}
              as <span className="font-medium text-warm-800">{props.userEmail}</span>
            </>
          ) : null}
          .
        </p>
      </div>

      {error && (
        <div
          className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-md flex gap-2 text-danger-800 text-sm"
          role="alert"
        >
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
            {errorDetails && (
              <p className="mt-1 text-danger-700 text-xs">{errorDetails}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Shop name"
          name="shopName"
          type="text"
          placeholder="E.g. Bloom & Stem Florals"
          value={formData.shopName}
          onChange={handleChange}
          required
          autoComplete="organization"
        />

        <Select
          label="State"
          name="state"
          placeholder="Select state"
          value={formData.state}
          onChange={handleChange}
          options={US_STATES}
          required
        />

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create shop & continue"}
        </Button>
      </form>
    </div>
  );
}
