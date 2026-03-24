"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Member = {
  userId: string;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
};

type TeamClientProps = {
  canInvite: boolean;
  inviteHint?: string;
};

const ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "analyst", label: "Analyst" },
];

export function TeamClient({ canInvite, inviteHint }: TeamClientProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const res = await fetch("/api/shop/team");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load team");
      }
      setMembers(data.members ?? []);
      if (data.warning) setWarning(data.warning);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/shop/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invite failed");
      setInviteMsg("Invite sent and teammate added.");
      setEmail("");
      await load();
    } catch (err) {
      setInviteMsg(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-8">
      {canInvite && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="text-brand-600" size={20} />
              <h2 className="font-display text-lg font-semibold text-warm-900">
                Invite teammate
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            {inviteHint && (
              <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                {inviteHint}
              </p>
            )}
            <form onSubmit={onInvite} className="grid gap-4 md:grid-cols-2 md:items-end">
              <Input
                type="email"
                label="Email"
                placeholder="colleague@shop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Select
                label="Role"
                options={ROLE_OPTIONS}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <div className="md:col-span-2">
                <Button type="submit" loading={inviting} disabled={inviting}>
                  Send invite & add to shop
                </Button>
              </div>
            </form>
            {inviteMsg && (
              <p className="mt-3 text-sm text-warm-600" role="status">
                {inviteMsg}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-warm-900">Members</h2>
        </CardHeader>
        <CardBody>
          {loading && <p className="text-sm text-warm-500">Loading…</p>}
          {error && <p className="text-sm text-danger-600">{error}</p>}
          {warning && <p className="text-sm text-amber-800 mb-3">{warning}</p>}
          {!loading && !error && members.length === 0 && (
            <p className="text-sm text-warm-500">No members found.</p>
          )}
          {!loading && !error && members.length > 0 && (
            <ul className="divide-y divide-warm-150">
              {members.map((m) => (
                <li
                  key={m.userId}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="shrink-0 text-warm-400" size={16} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-warm-800 truncate">
                        {m.email ?? `User ${m.userId.slice(0, 8)}…`}
                      </p>
                      <p className="text-xs text-warm-500">
                        Joined {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{m.role}</Badge>
                    <Badge variant={m.status === "active" ? "success" : "warning"}>
                      {m.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
