"use client";

import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  callCount: number;
  orderCount: number;
  lifetimeValue: number;
}

interface TopCustomersTableProps {
  customers: Customer[];
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  if (customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-warm-900">Top Customers</h3>
          <p className="text-sm text-warm-600 mt-1">
            Most active customers by call volume
          </p>
        </CardHeader>
        <CardBody>
          <EmptyState
            icon={Users}
            title="No customer data yet"
            description="Customer activity will appear here once you start receiving calls"
          />
        </CardBody>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-warm-900">Top Customers</h3>
        <p className="text-sm text-warm-600 mt-1">
          Most active customers by call volume
        </p>
      </CardHeader>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-warm-150">
                <th className="px-5 py-3 text-left text-xs font-medium text-warm-600 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-warm-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-warm-600 uppercase tracking-wider">
                  Calls
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-warm-600 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-warm-600 uppercase tracking-wider">
                  LTV
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {customers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-warm-50"}
                >
                  <td className="px-5 py-3 text-sm font-medium text-warm-900">
                    #{index + 1}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="flex items-center gap-3 hover:text-brand-600 transition-colors"
                    >
                      <Avatar
                        src={customer.avatar_url}
                        firstName={customer.name?.split(" ")[0] || "Unknown"}
                        lastName={customer.name?.split(" ").slice(1).join(" ") || ""}
                        size="sm"
                      />
                      <div>
                        <div className="text-sm font-medium text-warm-900">
                          {customer.name || customer.phone || "Unknown"}
                        </div>
                        <div className="text-xs text-warm-500">
                          {customer.phone}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-warm-700">
                    {customer.callCount}
                  </td>
                  <td className="px-5 py-3 text-sm text-warm-700">
                    {customer.orderCount}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-warm-900">
                    {formatCurrency(customer.lifetimeValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
