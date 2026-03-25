"use client";

import { useState } from "react";
import { Store, Save, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { US_STATES } from "@/lib/constants/us-states";

type ShopSettingsClientProps = {
  shopName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  timezone: string;
  customGreeting: string | null;
  consentMode: string;
  canEdit: boolean;
};

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HT)" },
];

const CONSENT_MODES = [
  { value: "auto", label: "Auto (one-party states silent, two-party discloses)" },
  { value: "always_disclose", label: "Always disclose recording" },
  { value: "silent", label: "Silent recording (check local laws)" },
];

export function ShopSettingsClient({
  shopName,
  address: initAddress,
  city: initCity,
  state: initState,
  zip: initZip,
  timezone: initTimezone,
  customGreeting: initGreeting,
  consentMode: initConsent,
  canEdit,
}: ShopSettingsClientProps) {
  const [form, setForm] = useState({
    name: shopName,
    address: initAddress ?? "",
    city: initCity ?? "",
    state: initState ?? "",
    zip: initZip ?? "",
    timezone: initTimezone,
    custom_greeting: initGreeting ?? "",
    consent_mode: initConsent,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handle = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/shop/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || undefined,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          zip: form.zip || null,
          timezone: form.timezone,
          custom_greeting: form.custom_greeting || null,
          consent_mode: form.consent_mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Shop settings saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="text-brand-600" size={20} />
            <h2 className="font-display text-lg font-semibold text-warm-900">Shop details</h2>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Shop name"
              value={form.name}
              onChange={handle("name")}
              required
              disabled={!canEdit}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Address"
                value={form.address}
                onChange={handle("address")}
                placeholder="123 Bloom St"
                disabled={!canEdit}
              />
              <Input
                label="City"
                value={form.city}
                onChange={handle("city")}
                placeholder="Portland"
                disabled={!canEdit}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="State"
                options={US_STATES}
                placeholder="Select"
                value={form.state}
                onChange={handle("state")}
                disabled={!canEdit}
              />
              <Input
                label="ZIP"
                value={form.zip}
                onChange={handle("zip")}
                placeholder="97201"
                disabled={!canEdit}
              />
              <Select
                label="Timezone"
                options={TIMEZONES}
                value={form.timezone}
                onChange={handle("timezone")}
                disabled={!canEdit}
              />
            </div>

            {canEdit && (
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Save shop details
                </Button>
                {message && (
                  <span className="text-sm text-warm-600">{message}</span>
                )}
              </div>
            )}
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="text-brand-600" size={20} />
            <h2 className="font-display text-lg font-semibold text-warm-900">
              Telephony & consent
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={handleSave}
            className="space-y-4"
          >
            <Input
              label="Custom greeting"
              value={form.custom_greeting}
              onChange={handle("custom_greeting")}
              placeholder="Thank you for calling [Shop Name]…"
              helperText="Played at the start of AI-assisted calls."
              disabled={!canEdit}
            />

            <Select
              label="Recording consent mode"
              options={CONSENT_MODES}
              value={form.consent_mode}
              onChange={handle("consent_mode")}
              disabled={!canEdit}
            />

            {canEdit && (
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Save telephony settings
                </Button>
              </div>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
