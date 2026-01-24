"use client";

import { useState } from "react";
import { useScenarios } from "../../hooks/useScenarios";
import { Scenario } from "../../types/topology";
import ScenarioList from "../../components/ScenarioList";
import AdHocDeployForm from "../../components/AdHocDeployForm";
import { ArrowLeft, Network } from "lucide-react";

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

  // Detail view with deploy
  if (viewingScenario) {
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

        {/* Ad-Hoc Deploy Form with Scenario Details */}
        <AdHocDeployForm
          scenario={viewingScenario}
          onBack={handleBack}
          readOnly
        />
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
