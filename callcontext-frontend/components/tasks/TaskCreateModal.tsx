"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/formatting";

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
  customers: any[];
  existingTask?: any;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-gray-400" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-red-500" },
];

export function TaskCreateModal({
  open,
  onClose,
  onCreate,
  customers,
  existingTask,
}: TaskCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && existingTask) {
      setTitle(existingTask.title || "");
      setDescription(existingTask.description || "");
      setCustomerId(existingTask.customer_id || "");
      setDueDate(existingTask.due_date || "");
      setPriority(existingTask.priority || "medium");
    } else if (!open) {
      setTitle("");
      setDescription("");
      setCustomerId("");
      setDueDate("");
      setPriority("medium");
      setError("");
    }
  }, [open, existingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        customer_id: customerId || null,
        due_date: dueDate || null,
        priority,
      };

      const url = existingTask
        ? `/api/tasks/${existingTask.id}`
        : "/api/tasks";
      const method = existingTask ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save task");
      }

      onCreate();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerOptions = [
    { value: "", label: "None" },
    ...customers.map((c) => ({
      value: c.id,
      label:
        c.first_name || c.last_name
          ? `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()
          : c.phone,
    })),
  ];

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={existingTask ? "Edit Task" : "Create Task"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Follow up with customer"
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
            className={cn(
              "w-full px-3 py-2 text-sm text-warm-700 bg-white border border-warm-200 rounded-md transition-all duration-150",
              "placeholder:text-warm-400",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              "disabled:bg-warm-50 disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          />
        </div>

        <Select
          label="Customer"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          options={customerOptions}
        />

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-warm-700 mb-2">
            Priority
          </label>
          <div className="flex gap-3">
            {PRIORITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all",
                  priority === opt.value
                    ? "border-brand-500 bg-brand-50"
                    : "border-warm-200 bg-white hover:border-warm-300"
                )}
              >
                <input
                  type="radio"
                  name="priority"
                  value={opt.value}
                  checked={priority === opt.value}
                  onChange={(e) =>
                    setPriority(e.target.value as "low" | "medium" | "high")
                  }
                  className="sr-only"
                />
                <span className={cn("w-3 h-3 rounded-full shrink-0", opt.color)} />
                <span className="text-sm font-medium text-warm-700">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : existingTask
                ? "Update Task"
                : "Create Task"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
