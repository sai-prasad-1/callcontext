"use client";

import { useState, useEffect } from "react";
import { ApiKeyManager } from "./ApiKeyManager";
import { WebhookManager } from "./WebhookManager";
import { Spinner } from "@/components/ui/Spinner";

export function ApiSettingsClient() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhookEndpoints, setWebhookEndpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [keysRes, endpointsRes] = await Promise.all([
          fetch("/api/api-keys"),
          fetch("/api/webhooks"),
        ]);

        if (keysRes.ok) {
          const data = await keysRes.json();
          setApiKeys(data.keys || []);
        }

        if (endpointsRes.ok) {
          const data = await endpointsRes.json();
          setWebhookEndpoints(data.endpoints || []);
        }
      } catch (error) {
        console.error("Failed to fetch API settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <ApiKeyManager initialKeys={apiKeys} />
      <WebhookManager initialEndpoints={webhookEndpoints} />
    </>
  );
}
