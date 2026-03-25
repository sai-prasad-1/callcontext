"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { X, TrendingUp, TrendingDown, Edit } from "lucide-react";
import { cn } from "@/lib/utils/formatting";

type Transaction = {
  id: string;
  type: "earn" | "redeem" | "adjustment" | "expire";
  points: number;
  description: string | null;
  created_at: string;
};

interface PointsHistoryTableProps {
  customerId: string;
  onClose: () => void;
}

const TYPE_CONFIG = {
  earn: { label: "Earned", variant: "success" as const, icon: TrendingUp },
  redeem: { label: "Redeemed", variant: "danger" as const, icon: TrendingDown },
  adjustment: { label: "Adjustment", variant: "warning" as const, icon: Edit },
  expire: { label: "Expired", variant: "neutral" as const, icon: TrendingDown },
};

export function PointsHistoryTable({
  customerId,
  onClose,
}: PointsHistoryTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetchTransactions();
  }, [customerId, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/loyalty/${customerId}`);
      if (res.ok) {
        const data = await res.json();
        const allTransactions = data.transactions || [];
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedTransactions = allTransactions.slice(
          startIndex,
          endIndex
        );
        setTransactions(paginatedTransactions);
        setHasMore(endIndex < allTransactions.length);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateRunningBalance = (
    transactions: Transaction[],
    currentIndex: number
  ) => {
    let balance = 0;
    for (let i = transactions.length - 1; i >= currentIndex; i--) {
      balance += transactions[i].points;
    }
    return balance;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-warm-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <Card className="relative w-full max-w-3xl animate-fade-in-up z-10 my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-warm-900">
              Points History
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-warm-400 hover:text-warm-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-warm-500 mt-2">
                Loading transactions...
              </p>
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="overflow-x-auto -mx-5">
                <table className="w-full">
                  <thead className="border-b border-warm-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-warm-500 px-5 py-3">
                        Date
                      </th>
                      <th className="text-left text-xs font-medium text-warm-500 px-3 py-3">
                        Type
                      </th>
                      <th className="text-left text-xs font-medium text-warm-500 px-3 py-3">
                        Description
                      </th>
                      <th className="text-right text-xs font-medium text-warm-500 px-3 py-3">
                        Points
                      </th>
                      <th className="text-right text-xs font-medium text-warm-500 px-5 py-3">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100">
                    {transactions.map((transaction, index) => {
                      const config = TYPE_CONFIG[transaction.type];
                      const TypeIcon = config.icon;
                      const balance = calculateRunningBalance(
                        transactions,
                        index
                      );

                      return (
                        <tr key={transaction.id} className="hover:bg-warm-50">
                          <td className="text-sm text-warm-600 px-5 py-3 whitespace-nowrap">
                            {new Date(transaction.created_at).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                            <span className="text-warm-400 text-xs ml-1">
                              {new Date(transaction.created_at).toLocaleTimeString(
                                undefined,
                                { hour: "numeric", minute: "2-digit" }
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant={config.variant}>
                              <TypeIcon size={12} className="mr-1" />
                              {config.label}
                            </Badge>
                          </td>
                          <td className="text-sm text-warm-700 px-3 py-3">
                            {transaction.description || "—"}
                          </td>
                          <td
                            className={cn(
                              "text-sm font-semibold px-3 py-3 text-right whitespace-nowrap",
                              transaction.points >= 0
                                ? "text-success-600"
                                : "text-danger-600"
                            )}
                          >
                            {transaction.points >= 0 ? "+" : ""}
                            {transaction.points}
                          </td>
                          <td className="text-sm font-medium text-warm-800 px-5 py-3 text-right whitespace-nowrap">
                            {balance}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(page > 1 || hasMore) && (
                <div className="flex items-center justify-between pt-4 border-t border-warm-100 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-warm-600">Page {page}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasMore || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-warm-500">No transactions yet</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
