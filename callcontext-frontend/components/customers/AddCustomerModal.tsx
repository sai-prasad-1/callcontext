"use client";

import { useState, type FormEvent } from "react";
import { Phone as PhoneIcon } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function validatePhone(value: string): string | null {
  if (!value.trim()) return "Phone number is required";
  if (!/^(\+|\d)/.test(value.trim())) {
    return "Phone must start with + or a digit";
  }
  if (value.replace(/[\s\-()]/g, "").length < 7) {
    return "Phone number is too short";
  }
  return null;
}

export function AddCustomerModal({ open, onClose, onCreated }: Props) {
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setPhone("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneError(null);
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

    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      return;
    }
    setPhoneError(null);
    setSubmitting(true);

    try {
      const body: Record<string, string> = { phone: phone.trim() };
      if (firstName.trim()) body.first_name = firstName.trim();
      if (lastName.trim()) body.last_name = lastName.trim();
      if (email.trim()) body.email = email.trim();

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      reset();
      onCreated();
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="Add customer" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Phone"
          required
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (phoneError) setPhoneError(null);
          }}
          error={phoneError ?? undefined}
          leftIcon={<PhoneIcon size={16} />}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="Jane"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

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
            Add customer
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
