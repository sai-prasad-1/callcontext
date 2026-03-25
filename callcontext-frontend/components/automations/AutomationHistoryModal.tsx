"use client";

import { useState, useEffect } from "react";
import { X, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  ruleId: string;
  ruleName: string;
  open: boolean;
  onClose: () => void;
}

interface Action {
  id: string;
  action_type: string;
  action_config: any;
  execute_at: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export function AutomationHistoryModal({ ruleId, ruleName, open, onClose }: Props) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, page, ruleId]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/automations/${ruleId}/history?page=${page}&limit=20`
      );
      if (res.ok) {
        const data = await res.json();
        setActions(data.actions || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch automation history:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getCustomerInfo(config: any): string {
    if (config.customer_id) {
      return `Customer: ${config.customer_id.slice(0, 8)}`;
    }
    if (config.to) {
      return `To: ${config.to}`;
    }
    return "N/A";
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200">
          <div>
            <h2 className="text-lg font-semibold text-warm-800">
              Execution History
            </h2>
            <p className="text-sm text-warm-600 mt-0.5">{ruleName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-warm-400 hover:text-warm-600 hover:bg-warm-100 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-lg border border-warm-150 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-full bg-warm-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-warm-200 rounded w-1/4" />
                    <div className="h-2.5 bg-warm-150 rounded w-1/2" />
                  </div>
                  <div className="h-6 w-20 bg-warm-150 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && actions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-warm-400" />
              </div>
              <h3 className="text-lg font-semibold text-warm-700">
                No executions yet
              </h3>
              <p className="text-sm text-warm-500 mt-1 max-w-sm">
                This automation hasn't been triggered yet. Once it runs, you'll see
                the execution history here.
              </p>
            </div>
          )}

          {!loading && actions.length > 0 && (
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-warm-150 hover:border-warm-250 transition-colors"
                >
                  <div className="shrink-0">
                    {action.status === "completed" && (
                      <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                        <CheckCircle size={16} className="text-success-600" />
                      </div>
                    )}
                    {action.status === "failed" && (
                      <div className="w-8 h-8 rounded-full bg-danger-100 flex items-center justify-center">
                        <XCircle size={16} className="text-danger-600" />
                      </div>
                    )}
                    {action.status === "pending" && (
                      <div className="w-8 h-8 rounded-full bg-info-100 flex items-center justify-center">
                        <Clock size={16} className="text-info-600" />
                      </div>
                    )}
                    {action.status === "cancelled" && (
                      <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center">
                        <XCircle size={16} className="text-warm-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-warm-800">
                        {formatDate(action.created_at)}
                      </span>
                      <Badge
                        variant={
                          action.status === "completed"
                            ? "success"
                            : action.status === "failed"
                            ? "danger"
                            : action.status === "pending"
                            ? "info"
                            : "neutral"
                        }
                      >
                        {action.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-warm-600">
                      {getCustomerInfo(action.action_config)}
                    </p>
                    {action.error && (
                      <p className="text-xs text-danger-600 mt-1 p-2 bg-danger-50 rounded">
                        {action.error}
                      </p>
                    )}
                    {action.completed_at && (
                      <p className="text-xs text-warm-500 mt-1">
                        Executed: {formatDate(action.completed_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-warm-200">
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
    </div>
  );
}
