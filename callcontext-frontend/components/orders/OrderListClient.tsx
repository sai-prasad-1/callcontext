"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  Package,
  Edit,
  ChevronDown,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/formatting";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";
import { OrderCreateModal } from "./OrderCreateModal";
import { OrderStatusFlow } from "./OrderStatusFlow";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const DATE_PRESETS = [
  { value: "all", label: "All" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
] as const;

const LIMIT = 20;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDateFrom(preset: string): string | undefined {
  if (preset === "all") return undefined;
  const now = new Date();
  const days = parseInt(preset);
  now.setDate(now.getDate() - days);
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

const STATUS_VARIANT_MAP: Record<string, "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  delivered: "success",
  cancelled: "danger",
};

interface OrderListClientProps {
  initialOrders: any[];
  initialTotal: number;
  shopConfig: ShopIndustryConfig;
}

export function OrderListClient({
  initialOrders,
  initialTotal,
  shopConfig,
}: OrderListClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  const isInitialMount = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(total / LIMIT);

  const serviceLabel = shopConfig.service_labels.order;
  const deliveryLabel = shopConfig.service_labels.delivery;
  const itemLabel = shopConfig.service_labels.item;

  const fetchOrders = useCallback(
    async (params: {
      page: number;
      search: string;
      status: string;
      dateRange: string;
    }) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        qs.set("page", String(params.page));
        qs.set("limit", String(LIMIT));
        if (params.search) qs.set("search", params.search);
        if (params.status !== "all") qs.set("status", params.status);
        const dateFrom = getDateFrom(params.dateRange);
        if (dateFrom) qs.set("date_from", dateFrom);

        const res = await fetch(`/api/orders?${qs.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setOrders(data.orders);
        setTotal(data.total);
      } catch {
        // keep current state on error
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchOrders({ page: 1, search, status, dateRange });
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, status, dateRange, fetchOrders]);

  useEffect(() => {
    if (isInitialMount.current) return;
    fetchOrders({ page, search, status, dateRange });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleOrderCreated = () => {
    fetchOrders({ page, search, status, dateRange });
  };

  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setEditingOrder(null);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const rangeStart = (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(page * LIMIT, total);

  const capitalizedServiceLabel =
    serviceLabel.charAt(0).toUpperCase() + serviceLabel.slice(1);

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-warm-800">
              {capitalizedServiceLabel}s
            </h1>
            <p className="text-warm-500 mt-1">
              View and manage all {serviceLabel}s.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Add {capitalizedServiceLabel}
          </Button>
        </div>

        <Card>
          <CardBody className="space-y-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 h-10 text-sm rounded-lg border border-warm-200 bg-white",
                  "text-warm-700 placeholder:text-warm-400",
                  "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                  "transition-colors"
                )}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
                      status === opt.value
                        ? "bg-brand-50 text-brand-700 border-brand-200"
                        : "bg-white text-warm-600 border-warm-200 hover:bg-warm-50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-warm-200 hidden sm:block" />

              <div className="flex items-center gap-1">
                {DATE_PRESETS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDateRange(opt.value)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
                      dateRange === opt.value
                        ? "bg-brand-50 text-brand-700 border-brand-200"
                        : "bg-white text-warm-600 border-warm-200 hover:bg-warm-50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : orders.length === 0 ? (
            <Card>
              <CardBody>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center mb-4">
                    <Package size={24} className="text-warm-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-warm-700">
                    No {serviceLabel}s yet
                  </h3>
                  <p className="text-sm text-warm-500 mt-1 max-w-sm">
                    {capitalizedServiceLabel}s will appear here once you create them.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setCreateModalOpen(true)}
                    className="mt-4"
                  >
                    Create First {capitalizedServiceLabel}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            orders.map((order: any) => (
              <OrderRow
                key={order.id}
                order={order}
                expanded={expandedOrderId === order.id}
                onToggleExpand={() =>
                  setExpandedOrderId(
                    expandedOrderId === order.id ? null : order.id
                  )
                }
                onEdit={handleEditOrder}
                onStatusChange={handleStatusChange}
                shopConfig={shopConfig}
                deliveryLabel={deliveryLabel}
                itemLabel={itemLabel}
              />
            ))
          )}
        </div>

        {total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-warm-500">
              Showing{" "}
              <span className="font-medium text-warm-700">{rangeStart}</span>
              {" – "}
              <span className="font-medium text-warm-700">{rangeEnd}</span>
              {" of "}
              <span className="font-medium text-warm-700">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <OrderCreateModal
        open={createModalOpen}
        onClose={handleCloseModal}
        onCreated={handleOrderCreated}
        shopConfig={shopConfig}
        existingOrder={editingOrder}
        customers={customers}
      />
    </>
  );
}

interface OrderRowProps {
  order: any;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: (order: any) => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  shopConfig: ShopIndustryConfig;
  deliveryLabel: string;
  itemLabel: string;
}

function OrderRow({
  order,
  expanded,
  onToggleExpand,
  onEdit,
  onStatusChange,
  shopConfig,
  deliveryLabel,
  itemLabel,
}: OrderRowProps) {
  const customer = order.customer;
  const customerName =
    customer?.first_name || customer?.last_name
      ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
      : null;

  const productsString = order.products
    ? order.products.map((p: any) => `${p.name} (${p.quantity})`).join(", ")
    : "—";

  const truncatedProducts =
    productsString.length > 60
      ? productsString.substring(0, 60) + "..."
      : productsString;

  return (
    <Card className="transition-all duration-150">
      <CardBody className="p-0">
        <button
          onClick={onToggleExpand}
          className="w-full text-left p-5 hover:bg-warm-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 w-36 shrink-0">
              <Avatar
                firstName={customer?.first_name}
                lastName={customer?.last_name}
                size="md"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-warm-800 truncate">
                  {customerName ?? customer?.phone ?? "Unknown"}
                </p>
                <p className="text-xs text-warm-500 truncate">
                  {order.created_at ? formatDate(order.created_at) : "—"}
                </p>
              </div>
            </div>

            <div className="flex-1 min-w-0 hidden md:block">
              <p className="text-sm text-warm-600 truncate">{truncatedProducts}</p>
            </div>

            <div className="hidden lg:block w-32 shrink-0">
              <div className="flex items-center gap-1.5 text-sm text-warm-600">
                <Calendar size={14} className="text-warm-400" />
                <span className="truncate">
                  {order.delivery_date ? formatDate(order.delivery_date) : "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 text-sm font-semibold text-warm-700">
                <DollarSign size={14} className="text-warm-500" />
                {order.total_amount?.toFixed(2) ?? "0.00"}
              </div>

              <Badge variant={STATUS_VARIANT_MAP[order.status] ?? "neutral"}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>

              <ChevronDown
                size={18}
                className={cn(
                  "text-warm-400 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </div>
          </div>
        </button>

        {expanded && (
          <div className="border-t border-warm-150 p-5 space-y-4 bg-warm-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2">
                  {itemLabel}s
                </h4>
                {order.products && order.products.length > 0 ? (
                  <ul className="space-y-1">
                    {order.products.map((p: any, idx: number) => (
                      <li key={idx} className="text-sm text-warm-700">
                        {p.name} — <span className="font-medium">Qty: {p.quantity}</span> @ ${p.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-warm-400 italic">No {itemLabel}s</p>
                )}
              </div>

              <div className="space-y-3">
                {order.delivery_date && (
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-warm-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-warm-500">{deliveryLabel}</p>
                      <p className="text-sm text-warm-700">{formatDate(order.delivery_date)}</p>
                    </div>
                  </div>
                )}

                {order.delivery_address && (
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-warm-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-warm-500">Address</p>
                      <p className="text-sm text-warm-700">{order.delivery_address}</p>
                    </div>
                  </div>
                )}

                {order.occasion && (
                  <div className="flex items-start gap-2">
                    <Package size={16} className="text-warm-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-warm-500">Occasion</p>
                      <p className="text-sm text-warm-700">
                        {order.occasion.charAt(0).toUpperCase() +
                          order.occasion.slice(1).replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                )}

                {order.special_instructions && (
                  <div>
                    <p className="text-xs font-medium text-warm-500 mb-1">Special instructions</p>
                    <p className="text-sm text-warm-700">{order.special_instructions}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-warm-200 pt-4">
              <OrderStatusFlow
                orderId={order.id}
                currentStatus={order.status}
                onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                icon={Edit}
                onClick={() => onEdit(order)}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-4 animate-pulse">
          <div className="flex items-center gap-3 w-36 shrink-0">
            <div className="w-10 h-10 rounded-full bg-warm-200" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-warm-200 rounded w-20" />
              <div className="h-3 bg-warm-150 rounded w-16" />
            </div>
          </div>
          <div className="flex-1 hidden md:block">
            <div className="h-3.5 bg-warm-150 rounded w-3/4" />
          </div>
          <div className="hidden lg:block w-32">
            <div className="h-3.5 bg-warm-150 rounded w-24" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-3.5 bg-warm-150 rounded w-12" />
            <div className="h-6 bg-warm-150 rounded-full w-20" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
