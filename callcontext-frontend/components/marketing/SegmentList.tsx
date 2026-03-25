"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Edit, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentBuilder } from "@/components/marketing/SegmentBuilder";

type SegmentWithCount = {
  id: string;
  name: string;
  description: string | null;
  filter: Record<string, any>;
  is_preset: boolean;
  customer_count: number;
  created_at: string;
  updated_at: string;
};

interface Props {
  initialSegments: SegmentWithCount[];
}

export function SegmentList({ initialSegments }: Props) {
  const [segments, setSegments] = useState<SegmentWithCount[]>(initialSegments);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<SegmentWithCount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const presetSegments = segments.filter((s) => s.is_preset);
  const customSegments = segments.filter((s) => !s.is_preset);

  async function refreshSegments() {
    try {
      const res = await fetch("/api/segments");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSegments(data.segments);
    } catch (error) {
      console.error("Failed to refresh segments:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this segment?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/segments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete segment");
        return;
      }
      await refreshSegments();
    } catch (error) {
      alert("Failed to delete segment");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(segment: SegmentWithCount) {
    setEditingSegment(segment);
    setBuilderOpen(true);
  }

  function handleBuilderClose() {
    setBuilderOpen(false);
    setEditingSegment(null);
  }

  async function handleSegmentSaved() {
    setBuilderOpen(false);
    setEditingSegment(null);
    await refreshSegments();
  }

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-warm-900">
            Customer Segments
          </h1>
          <p className="text-sm text-warm-600 mt-1">
            Organize and target customers with dynamic segments
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setBuilderOpen(true)}
        >
          Create segment
        </Button>
      </div>

      {/* Preset segments */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-warm-700 uppercase tracking-wide">
          Preset Segments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presetSegments.map((segment) => (
            <Link
              key={segment.id}
              href={`/dashboard/marketing/segments/${segment.id}`}
            >
              <Card variant="hover" className="p-4 h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-warm-900">
                    {segment.name}
                  </h3>
                  <Badge variant="neutral" className="shrink-0 ml-2">
                    <Users size={12} className="mr-1" />
                    {segment.customer_count}
                  </Badge>
                </div>
                {segment.description && (
                  <p className="text-xs text-warm-600 line-clamp-2">
                    {segment.description}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Custom segments */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-warm-700 uppercase tracking-wide">
          Custom Segments
        </h2>
        {customSegments.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="No custom segments yet"
            description="Create a custom segment to organize and target specific groups of customers."
            action={
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setBuilderOpen(true)}
              >
                Create your first segment
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {customSegments.map((segment) => (
              <Card key={segment.id} className="p-4">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/dashboard/marketing/segments/${segment.id}`}
                    className="flex-1 min-w-0 group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-warm-900 group-hover:text-brand-600 transition-colors">
                        {segment.name}
                      </h3>
                      <Badge variant="neutral">
                        <Users size={12} className="mr-1" />
                        {segment.customer_count}
                      </Badge>
                    </div>
                    {segment.description && (
                      <p className="text-xs text-warm-600 line-clamp-1">
                        {segment.description}
                      </p>
                    )}
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEdit(segment)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(segment.id)}
                      disabled={deletingId === segment.id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Segment builder modal */}
      <SegmentBuilder
        open={builderOpen}
        onClose={handleBuilderClose}
        onSave={handleSegmentSaved}
        existingSegment={editingSegment}
      />
    </div>
  );
}
