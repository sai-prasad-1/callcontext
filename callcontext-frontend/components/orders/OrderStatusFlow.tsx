"use client";

import { useState } from "react";
import { Check, Clock, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/formatting";

interface OrderStatusFlowProps {
  orderId: string;
  currentStatus: "pending" | "confirmed" | "delivered" | "cancelled";
  onStatusChange: (newStatus: "pending" | "confirmed" | "delivered" | "cancelled") => void;
}

const STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "delivered", label: "Delivered", icon: Check },
] as const;

export function OrderStatusFlow({
  orderId,
  currentStatus,
  onStatusChange,
}: OrderStatusFlowProps) {
  const [confirmingStatus, setConfirmingStatus] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStatus);

  const handleStepClick = (step: typeof STEPS[number]) => {
    const stepIndex = STEPS.findIndex((s) => s.key === step.key);
    if (stepIndex > currentStepIndex) {
      setConfirmingStatus(step.key);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmingStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: confirmingStatus }),
      });
      if (res.ok) {
        onStatusChange(confirmingStatus as any);
        setConfirmingStatus(null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        onStatusChange("cancelled");
        setConfirmingCancel(false);
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === "cancelled") {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger-50 text-danger-700 border border-danger-200">
          <AlertCircle size={18} />
          <span className="font-medium">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isPast = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isFuture = index > currentStepIndex;
            const isClickable = isFuture;

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => isClickable && handleStepClick(step)}
                    disabled={!isClickable}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isPast && "bg-success-500 text-white",
                      isCurrent && "bg-brand-500 text-white ring-4 ring-brand-100",
                      isFuture && "bg-warm-200 text-warm-500 hover:bg-warm-300 cursor-pointer",
                      !isClickable && "cursor-default"
                    )}
                  >
                    {isPast ? <Check size={18} /> : <Icon size={18} />}
                  </button>
                  <span
                    className={cn(
                      "text-xs font-medium mt-2",
                      (isPast || isCurrent) && "text-warm-700",
                      isFuture && "text-warm-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2",
                      index < currentStepIndex ? "bg-success-500" : "bg-warm-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {currentStatus !== "delivered" && (
          <div className="flex justify-center pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmingCancel(true)}
              className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 hover:border-danger-300"
            >
              Cancel Order
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!confirmingStatus}
        onClose={() => setConfirmingStatus(null)}
        title="Update Order Status"
        size="sm"
      >
        <p className="text-sm text-warm-600">
          Are you sure you want to mark this order as{" "}
          <span className="font-semibold">{confirmingStatus}</span>?
        </p>
        <ModalFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfirmingStatus(null)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmStatusChange}
            loading={loading}
          >
            Confirm
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={confirmingCancel}
        onClose={() => setConfirmingCancel(false)}
        title="Cancel Order"
        size="sm"
      >
        <p className="text-sm text-warm-600">
          Are you sure you want to cancel this order? This action cannot be undone.
        </p>
        <ModalFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfirmingCancel(false)}
            disabled={loading}
          >
            Go Back
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancelOrder}
            loading={loading}
          >
            Cancel Order
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
