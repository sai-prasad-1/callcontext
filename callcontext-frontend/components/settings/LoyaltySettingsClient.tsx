"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, Award, Gift, Check } from "lucide-react";
import { cn } from "@/lib/utils/formatting";

type Reward = {
  id: string;
  name: string;
  description: string;
  points_required: number;
};

type LoyaltySettings = {
  enabled: boolean;
  points_per_dollar: number;
  tiers: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  rewards: Reward[];
};

interface LoyaltySettingsClientProps {
  initialSettings: LoyaltySettings;
}

export function LoyaltySettingsClient({
  initialSettings,
}: LoyaltySettingsClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<LoyaltySettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState({
    name: "",
    description: "",
    points_required: 100,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/loyalty/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to save settings");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddReward = () => {
    setEditingReward(null);
    setRewardForm({ name: "", description: "", points_required: 100 });
    setShowRewardModal(true);
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setRewardForm({
      name: reward.name,
      description: reward.description,
      points_required: reward.points_required,
    });
    setShowRewardModal(true);
  };

  const handleSaveReward = () => {
    if (!rewardForm.name.trim()) return;

    if (editingReward) {
      setSettings((prev) => ({
        ...prev,
        rewards: prev.rewards.map((r) =>
          r.id === editingReward.id
            ? { ...r, ...rewardForm }
            : r
        ),
      }));
    } else {
      const newReward: Reward = {
        id: crypto.randomUUID(),
        ...rewardForm,
      };
      setSettings((prev) => ({
        ...prev,
        rewards: [...prev.rewards, newReward],
      }));
    }
    setShowRewardModal(false);
  };

  const handleDeleteReward = (rewardId: string) => {
    if (confirm("Are you sure you want to delete this reward?")) {
      setSettings((prev) => ({
        ...prev,
        rewards: prev.rewards.filter((r) => r.id !== rewardId),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-warm-900">
              Loyalty Program
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-warm-600">
                {settings.enabled ? "Enabled" : "Disabled"}
              </span>
              <button
                onClick={() =>
                  setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  settings.enabled ? "bg-brand-500" : "bg-warm-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.enabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-warm-600">
            Enable or disable the loyalty program for your customers. When
            enabled, customers earn points on purchases and can redeem rewards.
          </p>
        </CardBody>
      </Card>

      {/* Points Configuration */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-warm-800 flex items-center gap-2">
            <Award size={18} className="text-brand-500" />
            Points Configuration
          </h3>
        </CardHeader>
        <CardBody>
          <div className="max-w-xs">
            <Input
              type="number"
              label="Points per dollar spent"
              value={settings.points_per_dollar}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  points_per_dollar: Math.max(0, Number(e.target.value)),
                }))
              }
              min={0}
              step={0.1}
            />
            <p className="text-xs text-warm-500 mt-1.5">
              Customers will earn {settings.points_per_dollar} point
              {settings.points_per_dollar !== 1 ? "s" : ""} for every dollar
              spent.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Tier Thresholds */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-warm-800">
            Tier Thresholds
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                Bronze (Starting tier)
              </label>
              <div className="h-9 flex items-center px-3 text-sm text-warm-500 bg-warm-50 border border-warm-200 rounded-md">
                0 points
              </div>
            </div>

            <Input
              type="number"
              label="Silver"
              value={settings.tiers.silver}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  tiers: {
                    ...prev.tiers,
                    silver: Math.max(0, Number(e.target.value)),
                  },
                }))
              }
              min={0}
            />

            <Input
              type="number"
              label="Gold"
              value={settings.tiers.gold}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  tiers: {
                    ...prev.tiers,
                    gold: Math.max(0, Number(e.target.value)),
                  },
                }))
              }
              min={0}
            />

            <Input
              type="number"
              label="Platinum"
              value={settings.tiers.platinum}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  tiers: {
                    ...prev.tiers,
                    platinum: Math.max(0, Number(e.target.value)),
                  },
                }))
              }
              min={0}
            />
          </div>
        </CardBody>
      </Card>

      {/* Rewards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-warm-800 flex items-center gap-2">
              <Gift size={18} className="text-brand-500" />
              Rewards Catalog
            </h3>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleAddReward}
            >
              Add reward
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {settings.rewards.length > 0 ? (
            <div className="divide-y divide-warm-100">
              {settings.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center gap-4 py-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-warm-800">
                      {reward.name}
                    </h4>
                    <p className="text-xs text-warm-500 mt-0.5">
                      {reward.description}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-brand-600 whitespace-nowrap">
                    {reward.points_required} pts
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditReward(reward)}
                      className="p-1 text-warm-400 hover:text-brand-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="p-1 text-warm-400 hover:text-danger-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Gift size={32} className="mx-auto text-warm-300 mb-2" />
              <p className="text-sm text-warm-500">
                No rewards yet. Add rewards for customers to redeem.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} icon={Check}>
          Save settings
        </Button>
      </div>

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-warm-900/40 backdrop-blur-sm"
            onClick={() => setShowRewardModal(false)}
          />
          <Card className="relative w-full max-w-md animate-fade-in-up z-10">
            <CardHeader>
              <h2 className="text-lg font-display font-semibold text-warm-900">
                {editingReward ? "Edit Reward" : "Add Reward"}
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Reward name"
                value={rewardForm.name}
                onChange={(e) =>
                  setRewardForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g., $10 off next purchase"
              />

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={rewardForm.description}
                  onChange={(e) =>
                    setRewardForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe what the customer gets..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm text-warm-700 bg-white border border-warm-200 rounded-md placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>

              <Input
                type="number"
                label="Points required"
                value={rewardForm.points_required}
                onChange={(e) =>
                  setRewardForm((f) => ({
                    ...f,
                    points_required: Math.max(0, Number(e.target.value)),
                  }))
                }
                min={0}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRewardModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveReward}
                  disabled={!rewardForm.name.trim()}
                  icon={Check}
                >
                  {editingReward ? "Update" : "Add"} reward
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
