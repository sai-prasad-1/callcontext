"use client";

import { useState } from "react";
import {
  Webhook,
  Send,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Plus,
  Copy,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { WebhookDeliveryModal } from "./WebhookDeliveryModal";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  description?: string;
  active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  secret?: string;
}

interface WebhookManagerProps {
  initialEndpoints: WebhookEndpoint[];
}

const AVAILABLE_EVENTS = [
  { value: "customer.created", label: "Customer Created" },
  { value: "customer.updated", label: "Customer Updated" },
  { value: "call.completed", label: "Call Completed" },
  { value: "order.created", label: "Order Created" },
  { value: "order.updated", label: "Order Updated" },
];

export function WebhookManager({ initialEndpoints }: WebhookManagerProps) {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(initialEndpoints);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deliveryEndpointId, setDeliveryEndpointId] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState("");
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreateModal() {
    setShowCreateModal(true);
    setEditingId(null);
    setFormUrl("");
    setFormEvents([]);
    setFormDescription("");
    setError(null);
  }

  function openEditModal(endpoint: WebhookEndpoint) {
    setEditingId(endpoint.id);
    setShowCreateModal(true);
    setFormUrl(endpoint.url);
    setFormEvents(endpoint.events);
    setFormDescription(endpoint.description || "");
    setError(null);
  }

  function closeModal() {
    setShowCreateModal(false);
    setEditingId(null);
    setNewSecret(null);
    setCopied(false);
    setError(null);
  }

  async function handleSave() {
    if (!formUrl.trim()) {
      setError("URL is required");
      return;
    }

    if (formEvents.length === 0) {
      setError("At least one event is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        url: formUrl,
        events: formEvents,
        description: formDescription || undefined,
      };

      const res = editingId
        ? await fetch(`/api/webhooks/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/webhooks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save webhook");

      if (editingId) {
        setEndpoints((prev) =>
          prev.map((e) => (e.id === editingId ? data.endpoint : e))
        );
        closeModal();
      } else {
        setNewSecret(data.endpoint.secret);
        setEndpoints((prev) => [data.endpoint, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save webhook");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(endpointId: string) {
    if (!confirm("Are you sure you want to delete this webhook endpoint?")) {
      return;
    }

    try {
      const res = await fetch(`/api/webhooks/${endpointId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete webhook");

      setEndpoints((prev) => prev.filter((e) => e.id !== endpointId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete webhook");
    }
  }

  async function handleToggleActive(endpointId: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/webhooks/${endpointId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update webhook");

      setEndpoints((prev) =>
        prev.map((e) => (e.id === endpointId ? data.endpoint : e))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update webhook");
    }
  }

  async function handleTest(endpointId: string) {
    try {
      const res = await fetch(`/api/webhooks/${endpointId}/test`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test webhook");

      alert("Test webhook sent! Check the delivery history for details.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send test webhook");
    }
  }

  function handleCopy() {
    if (newSecret) {
      navigator.clipboard.writeText(newSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function toggleEvent(event: string) {
    setFormEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="text-brand-600" size={20} />
              <h3 className="font-semibold text-warm-900">Webhooks</h3>
            </div>
            <Button
              onClick={openCreateModal}
              size="sm"
              leftIcon={<Plus size={16} />}
            >
              Create Webhook
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {endpoints.length === 0 ? (
            <EmptyState
              icon={<Webhook size={48} className="text-warm-400" />}
              title="No webhooks yet"
              description="Create a webhook to receive real-time events from CallContext"
              action={
                <Button onClick={openCreateModal}>
                  Create your first webhook
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className="border border-warm-200 rounded-lg p-4 hover:bg-warm-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-warm-900 text-sm">
                          {endpoint.url}
                        </h4>
                        {endpoint.active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="default">Inactive</Badge>
                        )}
                      </div>
                      {endpoint.description && (
                        <p className="text-xs text-warm-600 mb-2">
                          {endpoint.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {endpoint.events.map((event) => (
                          <Badge key={event} variant="info" size="sm">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(endpoint.id, endpoint.active)}
                        title={endpoint.active ? "Deactivate" : "Activate"}
                      >
                        {endpoint.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTest(endpoint.id)}
                        leftIcon={<Send size={14} />}
                        title="Send test webhook"
                      >
                        Test
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeliveryEndpointId(endpoint.id)}
                        leftIcon={<Eye size={14} />}
                        title="View delivery history"
                      >
                        Deliveries
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(endpoint)}
                        leftIcon={<Edit size={14} />}
                        title="Edit webhook"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(endpoint.id)}
                        leftIcon={<Trash2 size={14} />}
                        title="Delete webhook"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  {endpoint.last_triggered_at && (
                    <div className="text-xs text-warm-500 flex items-center gap-1">
                      <Zap size={12} />
                      Last triggered: {new Date(endpoint.last_triggered_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={closeModal}
        title={
          newSecret
            ? "Webhook Created"
            : editingId
            ? "Edit Webhook"
            : "Create Webhook"
        }
        size="lg"
      >
        {!newSecret ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Endpoint URL
              </label>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://your-domain.com/webhooks"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Events
              </label>
              <div className="space-y-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <label
                    key={event.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formEvents.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                      disabled={saving}
                      className="rounded border-warm-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-warm-700">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g., Production webhook for customer sync"
                disabled={saving}
                rows={3}
                className="w-full px-3 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-warm-50 disabled:text-warm-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                {editingId ? "Save Changes" : "Create Webhook"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">
                  Save this secret now!
                </p>
                <p className="text-sm text-amber-700">
                  You won't be able to see this secret again. Use it to verify webhook signatures.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Webhook Secret
              </label>
              <div className="flex gap-2">
                <Input
                  value={newSecret}
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
              <Button onClick={closeModal}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {deliveryEndpointId && (
        <WebhookDeliveryModal
          endpointId={deliveryEndpointId}
          open={true}
          onClose={() => setDeliveryEndpointId(null)}
        />
      )}
    </>
  );
}
