"use client";

import { useState, useEffect, type FormEvent } from "react";
import { User, Calendar, Clock, Sparkles } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/formatting";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
  customers: any[];
  existingReminder?: any;
}

const ADVANCE_OPTIONS = [
  { value: "0", label: "On the day" },
  { value: "1", label: "1 day before" },
  { value: "3", label: "3 days before" },
  { value: "7", label: "1 week before" },
  { value: "14", label: "2 weeks before" },
  { value: "30", label: "1 month before" },
];

const RECURRING_OPTIONS = [
  { value: "", label: "None" },
  { value: "yearly", label: "Yearly" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

export function CreateReminderModal({
  open,
  onClose,
  onCreate,
  customers,
  existingReminder,
}: Props) {
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [advanceDays, setAdvanceDays] = useState("1");
  const [recurring, setRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReminder) {
      setCustomerId(existingReminder.customer_id || "");
      setTitle(existingReminder.title || "");
      setDescription(existingReminder.description || "");
      setReminderDate(
        existingReminder.reminder_date
          ? existingReminder.reminder_date.split("T")[0]
          : ""
      );
      setAdvanceDays(String(existingReminder.advance_days || 1));
      setRecurringPattern(existingReminder.recurring_pattern || "");
      setRecurring(!!existingReminder.recurring_pattern);
    }
  }, [existingReminder]);

  function reset() {
    setCustomerId("");
    setTitle("");
    setDescription("");
    setReminderDate("");
    setAdvanceDays("1");
    setRecurring(false);
    setRecurringPattern("");
    setSearchTerm("");
    setApiError(null);
    setSubmitting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);

    if (!customerId || !title.trim() || !reminderDate) {
      setApiError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const body: any = {
        customer_id: customerId,
        title: title.trim(),
        description: description.trim() || null,
        reminder_date: reminderDate,
        advance_days: parseInt(advanceDays),
        recurring_pattern: recurring ? recurringPattern || null : null,
      };

      const url = existingReminder
        ? `/api/reminders/${existingReminder.id}`
        : "/api/reminders";
      const method = existingReminder ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      reset();
      onCreate();
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const phone = c.phone || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || phone.includes(term);
  });

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const selectedCustomerName = selectedCustomer
    ? `${selectedCustomer.first_name || ""} ${selectedCustomer.last_name || ""}`.trim() ||
      selectedCustomer.phone
    : "";

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={existingReminder ? "Edit reminder" : "Add reminder"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Picker */}
        <div className="w-full">
          <label className="block text-sm font-medium text-warm-700 mb-1">
            Customer
            <span className="text-danger-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none z-10">
              <User size={16} />
            </div>
            <input
              type="text"
              placeholder="Search customer..."
              value={customerId ? selectedCustomerName : searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCustomerId("");
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              className={cn(
                "w-full h-9 pl-10 pr-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md transition-all duration-150",
                "placeholder:text-warm-400",
                "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              )}
            />
            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-warm-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      setCustomerId(customer.id);
                      setShowCustomerDropdown(false);
                      setSearchTerm("");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-warm-700 hover:bg-warm-50 flex flex-col"
                  >
                    <span className="font-medium">
                      {`${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
                        "Unknown"}
                    </span>
                    <span className="text-xs text-warm-500">
                      {customer.phone}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <Input
          label="Title"
          required
          placeholder="Annual review"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          leftIcon={<Calendar size={16} />}
        />

        {/* Description */}
        <div className="w-full">
          <label className="block text-sm font-medium text-warm-700 mb-1">
            Description
          </label>
          <textarea
            placeholder="Additional notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={cn(
              "w-full px-3 py-2 text-sm text-warm-700 bg-white border border-warm-200 rounded-md transition-all duration-150",
              "placeholder:text-warm-400",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              "resize-none"
            )}
          />
        </div>

        {/* Reminder Date */}
        <Input
          label="Reminder date"
          required
          type="date"
          value={reminderDate}
          onChange={(e) => setReminderDate(e.target.value)}
          leftIcon={<Calendar size={16} />}
        />

        {/* Advance Notice */}
        <Select
          label="Advance notice"
          options={ADVANCE_OPTIONS}
          value={advanceDays}
          onChange={(e) => setAdvanceDays(e.target.value)}
        />

        {/* Recurring Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recurring"
            checked={recurring}
            onChange={(e) => {
              setRecurring(e.target.checked);
              if (!e.target.checked) setRecurringPattern("");
            }}
            className="w-4 h-4 text-brand-500 border-warm-200 rounded focus:ring-2 focus:ring-brand-500"
          />
          <label
            htmlFor="recurring"
            className="text-sm font-medium text-warm-700 flex items-center gap-1"
          >
            <Sparkles size={14} className="text-brand-500" />
            Recurring reminder
          </label>
        </div>

        {/* Recurring Pattern */}
        {recurring && (
          <Select
            label="Recurring pattern"
            options={RECURRING_OPTIONS}
            value={recurringPattern}
            onChange={(e) => setRecurringPattern(e.target.value)}
            placeholder="Select pattern"
          />
        )}

        {apiError && (
          <div className="rounded-md bg-danger-50 border border-danger-200 px-3 py-2">
            <p className="text-sm text-danger-700">{apiError}</p>
          </div>
        )}

        <ModalFooter>
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            {existingReminder ? "Update reminder" : "Create reminder"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
