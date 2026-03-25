"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Award,
  Star,
  TrendingUp,
  Gift,
  History,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/formatting";
import { PointsHistoryTable } from "./PointsHistoryTable";

type Reward = {
  id: string;
  name: string;
  description: string;
  points_required: number;
};

type ShopConfig = {
  loyalty: {
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
};

interface CustomerLoyaltyCardProps {
  customerId: string;
  currentTier: "bronze" | "silver" | "gold" | "platinum";
  currentPoints: number;
  shopConfig: ShopConfig;
}

const TIER_CONFIG = {
  bronze: {
    label: "Bronze",
    color: "warm-700",
    bgColor: "warm-100",
    icon: Award,
  },
  silver: {
    label: "Silver",
    color: "gray-700",
    bgColor: "gray-100",
    icon: Star,
  },
  gold: {
    label: "Gold",
    color: "yellow-700",
    bgColor: "yellow-100",
    icon: Star,
  },
  platinum: {
    label: "Platinum",
    color: "purple-700",
    bgColor: "purple-100",
    icon: Star,
  },
};

export function CustomerLoyaltyCard({
  customerId,
  currentTier,
  currentPoints,
  shopConfig,
}: CustomerLoyaltyCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showRedeemConfirm, setShowRedeemConfirm] = useState<Reward | null>(
    null
  );

  if (!shopConfig.loyalty?.enabled) {
    return null;
  }

  const tier = TIER_CONFIG[currentTier];
  const Icon = tier.icon;
  const tiers = shopConfig.loyalty.tiers;

  const tierOrder = ["bronze", "silver", "gold", "platinum"];
  const currentTierIndex = tierOrder.indexOf(currentTier);
  const nextTierKey =
    currentTierIndex < tierOrder.length - 1
      ? tierOrder[currentTierIndex + 1]
      : null;
  const nextTierThreshold = nextTierKey
    ? tiers[nextTierKey as keyof typeof tiers]
    : null;

  const progressPercent = nextTierThreshold
    ? Math.min(100, (currentPoints / nextTierThreshold) * 100)
    : 100;

  const pointsToNext = nextTierThreshold
    ? Math.max(0, nextTierThreshold - currentPoints)
    : 0;

  const availableRewards = shopConfig.loyalty.rewards
    .filter((reward) => reward.points_required <= currentPoints)
    .sort((a, b) => a.points_required - b.points_required)
    .slice(0, 3);

  const handleRedeem = async (reward: Reward) => {
    setRedeeming(reward.id);
    try {
      const res = await fetch(`/api/loyalty/${customerId}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward_id: reward.id }),
      });

      if (res.ok) {
        alert(`Successfully redeemed: ${reward.name}`);
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to redeem reward");
      }
    } finally {
      setRedeeming(null);
      setShowRedeemConfirm(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-warm-800">
              Loyalty Program
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full",
                `bg-${tier.bgColor} text-${tier.color}`
              )}
            >
              <Icon size={12} />
              {tier.label}
            </span>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* Points Display */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-3xl font-display font-bold text-warm-900">
                  {currentPoints}
                </span>
                <span className="text-sm text-warm-500 ml-2">points</span>
              </div>
              {nextTierKey && (
                <div className="text-right">
                  <p className="text-xs text-warm-500">Next tier</p>
                  <p className="text-sm font-semibold text-warm-700">
                    {TIER_CONFIG[nextTierKey as keyof typeof TIER_CONFIG].label}
                  </p>
                </div>
              )}
            </div>

            {nextTierKey && (
              <>
                <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-warm-500 mt-1.5 flex items-center gap-1">
                  <TrendingUp size={12} />
                  {pointsToNext} more points to{" "}
                  {TIER_CONFIG[nextTierKey as keyof typeof TIER_CONFIG].label}
                </p>
              </>
            )}
          </div>

          {/* Available Rewards */}
          {availableRewards.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-warm-600 mb-2 flex items-center gap-1.5">
                <Gift size={14} />
                Available Rewards
              </h4>
              <div className="space-y-2">
                {availableRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center gap-3 p-3 bg-warm-50 rounded-lg border border-warm-100"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-warm-800 truncate">
                        {reward.name}
                      </h5>
                      <p className="text-xs text-warm-500 truncate">
                        {reward.description}
                      </p>
                      <p className="text-xs font-semibold text-brand-600 mt-0.5">
                        {reward.points_required} pts
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowRedeemConfirm(reward)}
                      loading={redeeming === reward.id}
                    >
                      Redeem
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View History */}
          <div className="pt-2 border-t border-warm-100">
            <button
              onClick={() => setShowHistory(true)}
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              <History size={14} />
              View points history
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Redeem Confirmation Modal */}
      {showRedeemConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-warm-900/40 backdrop-blur-sm"
            onClick={() => setShowRedeemConfirm(null)}
          />
          <Card className="relative w-full max-w-sm animate-fade-in-up z-10">
            <CardHeader>
              <h2 className="text-lg font-display font-semibold text-warm-900">
                Redeem Reward
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="p-4 bg-warm-50 rounded-lg border border-warm-100">
                <h3 className="font-medium text-warm-800">
                  {showRedeemConfirm.name}
                </h3>
                <p className="text-sm text-warm-600 mt-1">
                  {showRedeemConfirm.description}
                </p>
                <p className="text-sm font-semibold text-brand-600 mt-2">
                  Cost: {showRedeemConfirm.points_required} points
                </p>
              </div>
              <p className="text-sm text-warm-600">
                After redemption, the customer will have{" "}
                <span className="font-semibold">
                  {currentPoints - showRedeemConfirm.points_required} points
                </span>{" "}
                remaining.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={X}
                  onClick={() => setShowRedeemConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  icon={Check}
                  onClick={() => handleRedeem(showRedeemConfirm)}
                  loading={redeeming === showRedeemConfirm.id}
                >
                  Confirm redemption
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <PointsHistoryTable
          customerId={customerId}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
