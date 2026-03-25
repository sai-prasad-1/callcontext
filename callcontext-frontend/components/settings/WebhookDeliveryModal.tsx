"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

interface WebhookDelivery {
  id: string;
  event: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  attempts: number;
  delivered_at: string | null;
  failed_at: string | null;
  created_at: string;
}

interface WebhookDeliveryModalProps {
  endpointId: string;
  open: boolean;
  onClose: () => void;
}

export function WebhookDeliveryModal({
  endpointId,
  open,
  onClose,
}: WebhookDeliveryModalProps) {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (open) {
      fetchDeliveries();
    }
  }, [open, page, endpointId]);

  async function fetchDeliveries() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/webhooks/${endpointId}/deliveries?page=${page}&limit=20`
      );
      const data = await res.json();

      if (res.ok) {
        setDeliveries(data.deliveries || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpanded(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  function formatTimestamp(timestamp: string | null) {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  }

  function isSuccess(delivery: WebhookDelivery) {
    return delivery.delivered_at !== null;
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Delivery History" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-8 text-warm-600">
          <p>No deliveries yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {deliveries.map((delivery) => {
              const success = isSuccess(delivery);
              const isExpanded = expandedId === delivery.id;

              return (
                <div
                  key={delivery.id}
                  className="border border-warm-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(delivery.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-warm-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {success ? (
                          <CheckCircle size={18} className="text-green-600" />
                        ) : (
                          <AlertCircle size={18} className="text-red-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="info" size="sm">
                            {delivery.event}
                          </Badge>
                          {success ? (
                            <Badge variant="success" size="sm">
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="error" size="sm">
                              Failed
                            </Badge>
                          )}
                          {delivery.response_status && (
                            <span className="text-xs text-warm-600 font-mono">
                              {delivery.response_status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-warm-500">
                          <Clock size={12} />
                          {formatTimestamp(
                            delivery.delivered_at || delivery.failed_at
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp size={18} className="text-warm-400" />
                    ) : (
                      <ChevronDown size={18} className="text-warm-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 bg-warm-50">
                      <div>
                        <label className="block text-xs font-medium text-warm-600 mb-1">
                          Payload
                        </label>
                        <pre className="bg-white border border-warm-200 rounded p-2 text-xs overflow-x-auto max-h-48">
                          {JSON.stringify(delivery.payload, null, 2)}
                        </pre>
                      </div>

                      {delivery.response_body && (
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">
                            Response
                          </label>
                          <pre className="bg-white border border-warm-200 rounded p-2 text-xs overflow-x-auto max-h-48">
                            {delivery.response_body}
                          </pre>
                        </div>
                      )}

                      <div className="text-xs text-warm-600">
                        Attempts: {delivery.attempts}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-warm-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-warm-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
