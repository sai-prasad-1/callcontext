"use client";

import { useState } from "react";
import { PhoneIncoming, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TestCallButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function simulateCall() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/calls/test", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Simulated call from ${data.call.customer_name}`);
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to simulate call");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={simulateCall}
        disabled={loading}
        variant="outline"
        size="sm"
        leftIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <PhoneIncoming size={16} />}
      >
        {loading ? "Simulating..." : "Test Incoming Call"}
      </Button>
      {message && (
        <div className="text-xs text-warm-600 bg-warm-50 px-3 py-2 rounded-lg">
          {message}
        </div>
      )}
    </div>
  );
}
