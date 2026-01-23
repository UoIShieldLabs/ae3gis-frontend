"use client";

import { ScenarioListItem } from "../types/topology";
import { Network, Calendar, Trash2, Edit, Rocket, Eye } from "lucide-react";

interface ScenarioListProps {
  scenarios: ScenarioListItem[];
  loading: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDeploy?: (id: string) => void;
  readOnly?: boolean;
}

export default function ScenarioList({
  scenarios,
  loading,
  onView,
  onEdit,
  onDelete,
  onDeploy,
  readOnly = false,
}: ScenarioListProps) {
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

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
        <Network className="w-12 h-12 mx-auto text-[var(--muted)] mb-4" />
        <h3 className="text-lg font-medium mb-2">No Scenarios Found</h3>
        <p className="text-[var(--muted)]">
          {readOnly
            ? "No scenarios are available yet."
            : "Create your first scenario to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scenarios.map((scenario) => (
        <div
          key={scenario.id}
          className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)]/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <Network className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-semibold text-lg">{scenario.name}</h3>
              </div>
              {scenario.description && (
                <p className="text-sm text-[var(--muted)] mb-2">
                  {scenario.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created: {formatDate(scenario.created_at)}
                </span>
                {scenario.updated_at !== scenario.created_at && (
                  <span className="flex items-center gap-1">
                    Updated: {formatDate(scenario.updated_at)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {onView && (
                <button
                  onClick={() => onView(scenario.id)}
                  className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] rounded-lg transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {onDeploy && (
                <button
                  onClick={() => onDeploy(scenario.id)}
                  className="p-2 text-[var(--success)] hover:bg-[var(--success)]/10 rounded-lg transition-colors"
                  title="Deploy scenario"
                >
                  <Rocket className="w-4 h-4" />
                </button>
              )}
              {!readOnly && onEdit && (
                <button
                  onClick={() => onEdit(scenario.id)}
                  className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors"
                  title="Edit scenario"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {!readOnly && onDelete && (
                <button
                  onClick={() => onDelete(scenario.id)}
                  className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors"
                  title="Delete scenario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
