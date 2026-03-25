"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  ruleId: string;
  ruleName: string;
  currentTemplate: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditTemplateModal({
  ruleId,
  ruleName,
  currentTemplate,
  open,
  onClose,
  onUpdate,
}: Props) {
  const [template, setTemplate] = useState(currentTemplate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/automations/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template }),
      });

      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        setError("Failed to update template");
      }
    } catch (err) {
      console.error("Failed to update template:", err);
      setError("Failed to update template");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200">
          <div>
            <h2 className="text-lg font-semibold text-warm-800">
              Edit Template
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

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              Message Template
            </label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-warm-250 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-warm-800 placeholder:text-warm-400"
              placeholder="Enter your message template..."
            />
          </div>

          <div className="bg-info-50 border border-info-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-info-600 shrink-0 mt-0.5" />
              <div className="text-sm text-info-700">
                <p className="font-medium mb-1">Available variables:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    <code className="px-1 py-0.5 bg-white rounded">
                      {"{{first_name}}"}
                    </code>{" "}
                    - Customer's first name
                  </li>
                  <li>
                    <code className="px-1 py-0.5 bg-white rounded">
                      {"{{shop_name}}"}
                    </code>{" "}
                    - Your shop name
                  </li>
                  <li>
                    <code className="px-1 py-0.5 bg-white rounded">
                      {"{{customer_name}}"}
                    </code>{" "}
                    - Full customer name
                  </li>
                  <li>
                    <code className="px-1 py-0.5 bg-white rounded">
                      {"{{call_summary}}"}
                    </code>{" "}
                    - Call summary (for call-related rules)
                  </li>
                  <li>
                    <code className="px-1 py-0.5 bg-white rounded">
                      {"{{review_link}}"}
                    </code>{" "}
                    - Review link (for review requests)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-warm-200">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
