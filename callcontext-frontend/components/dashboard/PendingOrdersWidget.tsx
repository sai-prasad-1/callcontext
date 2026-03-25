import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeDate } from "@/lib/utils/formatting";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";

interface Props {
  orders: any[];
  shopConfig: ShopIndustryConfig;
}

export function PendingOrdersWidget({ orders, shopConfig }: Props) {
  const displayOrders = orders.slice(0, 5);
  const orderLabel = shopConfig.service_labels.order;
  
  function getStatusBadgeVariant(status: string) {
    if (status === "confirmed") return "success";
    if (status === "pending") return "warning";
    return "default";
  }
  
  function getProductsDisplay(products: any[]) {
    if (!products || products.length === 0) return "No products";
    const productNames = products.map((p: any) => p.name || p.item || "Product").join(", ");
    return productNames.length > 40 ? productNames.substring(0, 40) + "..." : productNames;
  }
  
  function formatAmount(amount: number | null) {
    if (!amount) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-success-500" />
          <h3 className="font-semibold text-warm-800">Pending {orderLabel}s</h3>
        </div>
        {orders.length > 0 && (
          <Link
            href="/dashboard/orders"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            View all
          </Link>
        )}
      </CardHeader>
      
      <CardBody className="pt-0">
        {displayOrders.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-2">
              <Package size={18} className="text-warm-400" />
            </div>
            <p className="text-sm text-warm-500">No pending {orderLabel.toLowerCase()}s</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => {
              const customerName = order.customer?.first_name || order.customer?.last_name
                ? `${order.customer.first_name ?? ""} ${order.customer.last_name ?? ""}`.trim()
                : "Unknown";
              
              return (
                <div
                  key={order.id}
                  className="p-3 rounded-md border border-warm-200 hover:border-brand-200 hover:bg-warm-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-800">
                        {customerName}
                      </p>
                      <p className="text-xs text-warm-600 truncate">
                        {getProductsDisplay(order.products)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-warm-500">
                    {order.delivery_date && (
                      <span>{formatRelativeDate(order.delivery_date)}</span>
                    )}
                    {order.total_amount && (
                      <span className="font-medium text-warm-700">
                        {formatAmount(order.total_amount)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
      
      {displayOrders.length > 0 && displayOrders.length < orders.length && (
        <CardFooter className="pt-0">
          <Link
            href="/dashboard/orders"
            className="flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors w-full"
          >
            View all {orderLabel.toLowerCase()}s
            <ArrowRight size={14} />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
