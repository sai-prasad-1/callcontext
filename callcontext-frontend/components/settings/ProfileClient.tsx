"use client";

import { useState, useEffect } from "react";
import { User, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

type ProfileData = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  phone: string | null;
  created_at: string;
};

export function ProfileClient({ initialEmail }: { initialEmail: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    phone: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (res.ok) {
          setProfile(data);
          setForm({
            first_name: data.first_name ?? "",
            last_name: data.last_name ?? "",
            display_name: data.display_name ?? "",
            phone: data.phone ?? "",
          });
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setMessage("Profile updated.");
      if (profile) {
        setProfile({
          ...profile,
          first_name: form.first_name || null,
          last_name: form.last_name || null,
          display_name: form.display_name || null,
          phone: form.phone || null,
        });
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const handle = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-warm-500 py-8">
        <Loader2 size={18} className="animate-spin" /> Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="text-brand-600" size={20} />
            <h2 className="font-display text-lg font-semibold text-warm-900">Your profile</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar
              firstName={form.first_name || null}
              lastName={form.last_name || null}
              size="lg"
            />
            <div>
              <p className="font-medium text-warm-800">
                {form.first_name || form.last_name
                  ? `${form.first_name} ${form.last_name}`.trim()
                  : initialEmail}
              </p>
              <p className="text-sm text-warm-500">{initialEmail}</p>
              {profile?.created_at && (
                <p className="text-xs text-warm-400 mt-1">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={form.first_name}
                onChange={handle("first_name")}
                placeholder="Jane"
                autoComplete="given-name"
              />
              <Input
                label="Last name"
                value={form.last_name}
                onChange={handle("last_name")}
                placeholder="Doe"
                autoComplete="family-name"
              />
            </div>
            <Input
              label="Display name"
              value={form.display_name}
              onChange={handle("display_name")}
              placeholder="How others see you"
              autoComplete="nickname"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={handle("phone")}
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />

            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Save profile
              </Button>
              {message && (
                <span className="text-sm text-warm-600">{message}</span>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-warm-900">Account details</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-warm-600">Email</span>
            <span className="text-sm font-medium text-warm-800">{initialEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-warm-600">User ID</span>
            <Badge variant="neutral">{profile?.id?.slice(0, 8) ?? "—"}…</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-warm-600">Authentication</span>
            <Badge variant="success">Email + password</Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
