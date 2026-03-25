"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, List as ListIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { TaskCard } from "./TaskCard";
import { TaskCreateModal } from "./TaskCreateModal";
import { cn } from "@/lib/utils/formatting";

interface TaskBoardClientProps {
  initialTasks: any[];
  userId: string;
  customers: any[];
}

type TaskStatus = "open" | "in_progress" | "done";

const STATUS_CONFIG = {
  open: { label: "To Do", color: "bg-warm-100 border-warm-200" },
  in_progress: { label: "In Progress", color: "bg-blue-50 border-blue-200" },
  done: { label: "Done", color: "bg-green-50 border-green-200" },
} as const;

const PRIORITY_WEIGHTS = { high: 3, medium: 2, low: 1 };

function sortTasks(tasks: any[]): any[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff =
      PRIORITY_WEIGHTS[b.priority as keyof typeof PRIORITY_WEIGHTS] -
      PRIORITY_WEIGHTS[a.priority as keyof typeof PRIORITY_WEIGHTS];
    if (priorityDiff !== 0) return priorityDiff;

    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
}

export function TaskBoardClient({
  initialTasks,
  userId,
  customers,
}: TaskBoardClientProps) {
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const groupedTasks = {
    open: sortTasks(tasks.filter((t) => t.status === "open")),
    in_progress: sortTasks(tasks.filter((t) => t.status === "in_progress")),
    done: sortTasks(tasks.filter((t) => t.status === "done")),
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error("Fetch tasks error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");
    } catch (error) {
      console.error("Update task error:", error);
      fetchTasks();
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setEditingTask(null), 150);
  };

  const handleCreate = () => {
    fetchTasks();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-warm-800">
            Tasks
          </h1>
          <p className="text-warm-500 mt-1">Manage your team's tasks</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile View Toggle */}
          <div className="md:hidden flex bg-warm-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                viewMode === "kanban"
                  ? "bg-white text-warm-700 shadow-sm"
                  : "text-warm-500 hover:text-warm-700"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-white text-warm-700 shadow-sm"
                  : "text-warm-500 hover:text-warm-700"
              )}
            >
              <ListIcon size={16} />
            </button>
          </div>
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Add Task
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop Kanban View */}
          <div className="hidden md:block">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-3 gap-4">
                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
                  <TaskColumn
                    key={status}
                    status={status}
                    tasks={groupedTasks[status]}
                    onUpdate={fetchTasks}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </DragDropContext>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {viewMode === "kanban" ? (
              <div className="space-y-4">
                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-warm-800">
                        {STATUS_CONFIG[status].label}
                      </h3>
                      <Badge variant="secondary" size="sm">
                        {groupedTasks[status].length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {groupedTasks[status].length === 0 ? (
                        <div className="text-sm text-warm-400 text-center py-8 border-2 border-dashed border-warm-200 rounded-lg">
                          No tasks
                        </div>
                      ) : (
                        groupedTasks[status].map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onUpdate={fetchTasks}
                            onEdit={() => handleEdit(task)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <EmptyState
                    title="No tasks yet"
                    description="Create your first task to get started"
                  />
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            task.status === "done"
                              ? "success"
                              : task.status === "in_progress"
                                ? "info"
                                : "secondary"
                          }
                          size="sm"
                        >
                          {STATUS_CONFIG[task.status as TaskStatus].label}
                        </Badge>
                      </div>
                      <TaskCard
                        task={task}
                        onUpdate={fetchTasks}
                        onEdit={() => handleEdit(task)}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      <TaskCreateModal
        open={modalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreate}
        customers={customers}
        existingTask={editingTask}
      />
    </div>
  );
}

interface TaskColumnProps {
  status: TaskStatus;
  tasks: any[];
  onUpdate: () => void;
  onEdit: (task: any) => void;
}

function TaskColumn({ status, tasks, onUpdate, onEdit }: TaskColumnProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-warm-800">{config.label}</h3>
          <Badge variant="secondary" size="sm">
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 rounded-lg border-2 p-3 space-y-2 min-h-[200px] transition-colors",
              config.color,
              snapshot.isDraggingOver && "ring-2 ring-brand-500 ring-offset-2"
            )}
          >
            {tasks.length === 0 ? (
              <div className="text-sm text-warm-400 text-center py-8">
                No tasks
              </div>
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <TaskCard
                        task={task}
                        draggableProps={provided.draggableProps}
                        dragHandleProps={provided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                        onUpdate={onUpdate}
                        onEdit={() => onEdit(task)}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
