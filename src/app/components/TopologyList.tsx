"use client";

import { TopologyListItem } from "../types/topology";
import { Network, Calendar, Trash2, Edit, ChevronRight } from "lucide-react";

interface TopologyListProps {
  topologies: TopologyListItem[];
  loading: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export default function TopologyList({
  topologies,
  loading,
  onView,
  onEdit,
  onDelete,
  readOnly = false,
}: TopologyListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (topologies.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
        <Network className="w-12 h-12 mx-auto text-[var(--muted)] mb-4" />
        <h3 className="text-lg font-medium mb-2">No Topologies Found</h3>
        <p className="text-[var(--muted)]">
          {readOnly
            ? "No topologies are available yet."
            : "Create your first topology to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topologies.map((topology) => (
        <div
          key={topology.id}
          onClick={() => onView?.(topology.id)}
          className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4 cursor-pointer transition-all hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/10 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <Network className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-semibold text-lg group-hover:text-[var(--accent)] transition-colors">
                  {topology.name}
                </h3>
              </div>
              {topology.description && (
                <p className="text-sm text-[var(--muted)] mb-2">
                  {topology.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created: {formatDate(topology.created_at)}
                </span>
                {topology.updated_at !== topology.created_at && (
                  <span className="flex items-center gap-1">
                    Updated: {formatDate(topology.updated_at)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {!readOnly && onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(topology.id);
                  }}
                  className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit topology"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {!readOnly && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(topology.id);
                  }}
                  className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete topology"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <ChevronRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
