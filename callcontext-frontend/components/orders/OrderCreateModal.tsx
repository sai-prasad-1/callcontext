"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, X, DollarSign, Calendar, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";

interface ProductRow {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Customer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

interface OrderCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  shopConfig: ShopIndustryConfig;
  existingOrder?: any;
  customers: Customer[];
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function OrderCreateModal({
  open,
  onClose,
  onCreated,
  shopConfig,
  existingOrder,
  customers,
}: OrderCreateModalProps) {
  const isEditMode = !!existingOrder;

  const [customerId, setCustomerId] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([
    { id: generateId(), name: "", quantity: 1, price: 0 },
  ]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const serviceLabel = shopConfig.service_labels.order;
  const deliveryLabel = shopConfig.service_labels.delivery;

  const customerOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label:
        c.first_name || c.last_name
          ? `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() +
            (c.phone ? ` (${c.phone})` : "")
          : c.phone ?? "Unknown",
    }));
  }, [customers]);

  const occasionOptions = useMemo(() => {
    return [
      { value: "", label: "Select occasion..." },
      ...shopConfig.occasion_vocabulary.map((o) => ({
        value: o,
        label: o.charAt(0).toUpperCase() + o.slice(1).replace(/_/g, " "),
      })),
      { value: "other", label: "Other" },
    ];
  }, [shopConfig.occasion_vocabulary]);

  useEffect(() => {
    if (existingOrder) {
      setCustomerId(existingOrder.customer_id ?? "");
      setProducts(
        existingOrder.products?.length
          ? existingOrder.products.map((p: any) => ({
              id: generateId(),
              name: p.name,
              quantity: p.quantity,
              price: p.price,
            }))
          : [{ id: generateId(), name: "", quantity: 1, price: 0 }]
      );
      setDeliveryDate(existingOrder.delivery_date ?? "");
      setDeliveryAddress(existingOrder.delivery_address ?? "");
      setOccasion(existingOrder.occasion ?? "");
      setSpecialInstructions(existingOrder.special_instructions ?? "");
      setTotalAmount(existingOrder.total_amount ?? 0);
    }
  }, [existingOrder]);

  useEffect(() => {
    const calculated = products.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0
    );
    setTotalAmount(calculated);
  }, [products]);

  const handleAddProduct = () => {
    setProducts([...products, { id: generateId(), name: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleProductChange = (
    id: string,
    field: keyof ProductRow,
    value: string | number
  ) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert("Please select a customer");
      return;
    }
    if (products.some((p) => !p.name || p.quantity <= 0 || p.price < 0)) {
      alert("Please fill in all product details correctly");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_id: customerId,
        products: products.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          price: p.price,
        })),
        delivery_date: deliveryDate || undefined,
        delivery_address: deliveryAddress || undefined,
        occasion: occasion || undefined,
        special_instructions: specialInstructions || undefined,
        total_amount: totalAmount,
      };

      const url = isEditMode
        ? `/api/orders/${existingOrder.id}`
        : "/api/orders";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onCreated();
        resetForm();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save order");
      }
    } catch (err) {
      console.error("Failed to save order:", err);
      alert("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerId("");
    setProducts([{ id: generateId(), name: "", quantity: 1, price: 0 }]);
    setDeliveryDate("");
    setDeliveryAddress("");
    setOccasion("");
    setSpecialInstructions("");
    setTotalAmount(0);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={isEditMode ? `Edit ${serviceLabel}` : `Create ${serviceLabel}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Customer"
          required
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          options={customerOptions}
          placeholder="Select a customer..."
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-warm-700">
            {shopConfig.service_labels.item}s <span className="text-danger-500">*</span>
          </label>
          {products.map((product, index) => (
            <div key={product.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`${shopConfig.service_labels.item} name`}
                  value={product.name}
                  onChange={(e) =>
                    handleProductChange(product.id, "name", e.target.value)
                  }
                  list={`product-suggestions-${product.id}`}
                  className="w-full h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                {shopConfig.product_vocabulary.items.length > 0 && (
                  <datalist id={`product-suggestions-${product.id}`}>
                    {shopConfig.product_vocabulary.items.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                )}
              </div>
              <input
                type="number"
                placeholder="Qty"
                value={product.quantity}
                onChange={(e) =>
                  handleProductChange(
                    product.id,
                    "quantity",
                    parseInt(e.target.value) || 0
                  )
                }
                min="1"
                className="w-20 h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={product.price}
                onChange={(e) =>
                  handleProductChange(
                    product.id,
                    "price",
                    parseFloat(e.target.value) || 0
                  )
                }
                step="0.01"
                min="0"
                className="w-24 h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(product.id)}
                  className="h-9 w-9 flex items-center justify-center text-danger-500 hover:bg-danger-50 rounded-md transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={handleAddProduct}
          >
            Add {shopConfig.service_labels.item}
          </Button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-lg border border-warm-200">
          <DollarSign size={18} className="text-warm-500" />
          <span className="text-sm font-medium text-warm-700">Total:</span>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0"
            className="flex-1 h-8 px-3 text-sm font-semibold text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <Input
          type="date"
          label={deliveryLabel}
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          leftIcon={<Calendar size={16} />}
        />

        <Input
          type="text"
          label={
            shopConfig.industry === "salon" || shopConfig.industry === "auto_shop"
              ? "Service location"
              : "Delivery address"
          }
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          leftIcon={<MapPin size={16} />}
          placeholder="Enter address..."
        />

        <Select
          label="Occasion"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          options={occasionOptions}
        />

        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">
            Special instructions
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
            placeholder="Add any special notes..."
            className="w-full px-3 py-2 text-sm text-warm-700 bg-white border border-warm-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {isEditMode ? "Save Changes" : `Create ${serviceLabel}`}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
