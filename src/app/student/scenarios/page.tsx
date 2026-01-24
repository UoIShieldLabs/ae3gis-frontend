"use client";

import { useState } from "react";
import { useScenarios } from "../../hooks/useScenarios";
import { Scenario } from "../../types/topology";
import ScenarioList from "../../components/ScenarioList";
import DeployForm from "../../components/DeployForm";
import { ArrowLeft, Network, FileCode2, Rocket, Calendar } from "lucide-react";

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Detail view with deploy
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
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-[var(--accent)]" />
              <h1 className="text-2xl font-bold">{viewingScenario.name}</h1>
            </div>
            {viewingScenario.description && (
              <p className="text-[var(--muted)] mt-1">{viewingScenario.description}</p>
            )}
          </div>
        </div>

        {/* Scenario Info */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-[var(--muted)]">Project Name:</span>
              <span className="ml-2 font-medium">{def.project_name}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Total Nodes:</span>
              <span className="ml-2 font-medium">{def.nodes.length}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Total Links:</span>
              <span className="ml-2 font-medium">{def.links.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--muted)]" />
              <span className="text-[var(--muted)]">Created:</span>
              <span className="ml-1">{formatDate(viewingScenario.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Deploy Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-[var(--success)]" />
            <h2 className="text-lg font-semibold">Deploy Scenario</h2>
          </div>
          <DeployForm scenario={viewingScenario} />
        </div>

        {/* Nodes Overview */}
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
                  {node.layer} • {node.template_key || node.template_name || "N/A"}
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
          Browse and deploy scenarios created by instructors
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
