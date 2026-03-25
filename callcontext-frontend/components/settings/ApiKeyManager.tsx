"use client";

import { useState } from "react";
import { Key, Copy, Trash2, AlertCircle, Plus, CheckCircle, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  total_requests: number;
  revoked: boolean;
  created_at: string;
}

interface ApiKeyManagerProps {
  initialKeys: ApiKey[];
}

export function ApiKeyManager({ initialKeys }: ApiKeyManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!createName.trim()) {
      setError("Name is required");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create API key");

      setNewKey(data.key);
      setKeys((prev) => [data.keyData, ...prev]);
      setCreateName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/api-keys/${keyId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to revoke API key");

      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, revoked: true } : k))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke API key");
    }
  }

  function handleCopy() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCloseModal() {
    setShowCreateModal(false);
    setNewKey(null);
    setCreateName("");
    setError(null);
    setCopied(false);
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="text-brand-600" size={20} />
            <h3 className="font-semibold text-warm-900">API Keys</h3>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            leftIcon={<Plus size={16} />}
          >
            Create Key
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {keys.length === 0 ? (
          <EmptyState
            icon={<Key size={48} className="text-warm-400" />}
            title="No API keys yet"
            description="Create an API key to access the CallContext REST API"
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                Create your first API key
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">Key</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">Last Used</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">Requests</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-warm-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr
                    key={key.id}
                    className={`border-b border-warm-100 ${
                      key.revoked ? "opacity-50" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-warm-900 font-medium">
                      {key.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-warm-600 font-mono">
                      {key.key_prefix}
                    </td>
                    <td className="py-3 px-4 text-sm text-warm-600">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-warm-400" />
                        {formatDate(key.last_used_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-warm-600">
                      <div className="flex items-center gap-1">
                        <Zap size={14} className="text-warm-400" />
                        {key.total_requests.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-warm-600">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {key.revoked ? (
                        <Badge variant="error">Revoked</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!key.revoked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(key.id)}
                          leftIcon={<Trash2 size={14} />}
                        >
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>

      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        title={newKey ? "API Key Created" : "Create API Key"}
        size="md"
      >
        {!newKey ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Key Name
              </label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g., Production API, Mobile App"
                disabled={creating}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseModal} disabled={creating}>
                Cancel
              </Button>
              <Button onClick={handleCreate} loading={creating}>
                Create Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">
                  Save this key now!
                </p>
                <p className="text-sm text-amber-700">
                  You won't be able to see this key again. Store it somewhere safe.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Your API Key
              </label>
              <div className="flex gap-2">
                <Input
                  value={newKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCopy}
                  leftIcon={copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCloseModal}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
