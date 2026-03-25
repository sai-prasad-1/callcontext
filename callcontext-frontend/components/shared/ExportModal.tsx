"use client";

import { useState } from "react";
import { Download, FileText, Calendar, Filter } from "lucide-react";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  exportType: "customers" | "calls" | "orders";
  shopConfig?: ShopIndustryConfig;
}

export function ExportModal({
  open,
  onClose,
  exportType,
  shopConfig,
}: ExportModalProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const getExportLabel = () => {
    if (exportType === "orders" && shopConfig) {
      return shopConfig.service_labels.order + "s";
    }
    return exportType.charAt(0).toUpperCase() + exportType.slice(1);
  };

  const getStatusOptions = () => {
    if (exportType === "calls") {
      return ["all", "completed", "missed", "voicemail"];
    }
    if (exportType === "orders") {
      return ["all", "pending", "confirmed", "delivered", "cancelled"];
    }
    return [];
  };

  const statusOptions = getStatusOptions();

  const handleStatusChange = (status: string) => {
    if (status === "all") {
      setStatusFilter(["all"]);
    } else {
      const filtered = statusFilter.filter((s) => s !== "all");
      if (filtered.includes(status)) {
        const newFilter = filtered.filter((s) => s !== status);
        setStatusFilter(newFilter.length === 0 ? ["all"] : newFilter);
      } else {
        setStatusFilter([...filtered, status]);
      }
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      if (
        (exportType === "calls" || exportType === "orders") &&
        !statusFilter.includes("all")
      ) {
        params.set("status", statusFilter[0] || "all");
      }

      const response = await fetch(`/api/export/${exportType}?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportType}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Export {getExportLabel()}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              Date Range (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="To"
              />
            </div>
          </div>

          {statusOptions.length > 0 && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="h-4 w-4" />
                Status Filter
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={() => handleStatusChange(status)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              Export complete!
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              "Exporting..."
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
