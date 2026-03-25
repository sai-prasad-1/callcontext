"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { AutomationCard } from "./AutomationCard";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  delay_hours: number;
  action_type: string;
  default_enabled: boolean;
  template: string;
  enabled: boolean;
  stats: {
    pending: number;
    completed: number;
    failed: number;
  };
}

export function AutomationsListClient() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    setLoading(true);
    try {
      const res = await fetch("/api/automations");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (error) {
      console.error("Failed to fetch automation rules:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-800">
          Automation Rules
        </h1>
        <p className="text-warm-500 mt-1">
          Automatically engage customers at the right time with smart triggers
          and actions.
        </p>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <div className="space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-warm-200 rounded w-1/3" />
                    <div className="h-6 w-12 bg-warm-200 rounded-full" />
                  </div>
                  <div className="h-3 bg-warm-150 rounded w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-warm-150 rounded w-16" />
                    <div className="h-5 bg-warm-150 rounded w-20" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {!loading && rules.length === 0 && (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center mb-4">
                <Zap size={24} className="text-warm-400" />
              </div>
              <h3 className="text-lg font-semibold text-warm-700">
                No automation rules available
              </h3>
              <p className="text-sm text-warm-500 mt-1 max-w-sm">
                Automation rules help you engage customers automatically based on
                their interactions with your business.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {!loading && rules.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule) => (
            <AutomationCard key={rule.id} rule={rule} onUpdate={fetchRules} />
          ))}
        </div>
      )}
    </div>
  );
}
