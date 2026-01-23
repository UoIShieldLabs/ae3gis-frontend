"use client";

import { useState } from "react";
import { useScenarios } from "../../hooks/useScenarios";
import { Scenario } from "../../types/topology";
import ScenarioList from "../../components/ScenarioList";
import { ArrowLeft, Network, FileCode2 } from "lucide-react";

export default function StudentScenariosPage() {
  const { scenarios, loading, fetchScenario } = useScenarios();
  const [viewingScenario, setViewingScenario] = useState<Scenario | null>(null);

  const handleView = async (id: string) => {
    const scenario = await fetchScenario(id);
    if (scenario) {
      setViewingScenario(scenario);
    }
  };

  const handleBack = () => {
    setViewingScenario(null);
  };

  // Detail view
  if (viewingScenario) {
    const def = viewingScenario.definition;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{viewingScenario.name}</h1>
            {viewingScenario.description && (
              <p className="text-[var(--muted)]">{viewingScenario.description}</p>
            )}
          </div>
        </div>

        {/* Scenario Details */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Overview */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="font-semibold mb-3">Overview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Project Name:</span>
                <span>{def.project_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Total Nodes:</span>
                <span>{def.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Total Links:</span>
                <span>{def.links.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Templates Used:</span>
                <span>{Object.keys(def.templates).length}</span>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="font-semibold mb-3">Templates</h3>
            <div className="space-y-1 text-sm">
              {Object.keys(def.templates).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Network className="w-3 h-3 text-[var(--accent)]" />
                  <span>{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nodes */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-semibold mb-3">Nodes ({def.nodes.length})</h3>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {def.nodes.map((node, i) => (
              <div
                key={i}
                className="p-3 bg-[var(--input-bg)] rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{node.name}</span>
                  {node.scripts.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
                      <FileCode2 className="w-3 h-3" />
                      {node.scripts.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Template: {node.template_key || node.template_name || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available Scenarios</h1>
        <p className="text-[var(--muted)]">
          Browse scenarios created by instructors
        </p>
      </div>

      <ScenarioList
        scenarios={scenarios}
        loading={loading}
        onView={handleView}
        readOnly
      />
    </div>
  );
}
