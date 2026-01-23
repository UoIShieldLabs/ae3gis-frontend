"use client";

import { useState } from "react";
import { useScenarios } from "../../hooks/useScenarios";
import { Scenario } from "../../types/topology";
import ScenarioList from "../../components/ScenarioList";
import DeployForm from "../../components/DeployForm";
import { ArrowLeft } from "lucide-react";

export default function InstructorDeployPage() {
  const { scenarios, loading, fetchScenario } = useScenarios();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const handleSelectScenario = async (id: string) => {
    const scenario = await fetchScenario(id);
    if (scenario) {
      setSelectedScenario(scenario);
    }
  };

  const handleBack = () => {
    setSelectedScenario(null);
  };

  // Deploy view
  if (selectedScenario) {
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
            <h1 className="text-2xl font-bold">Deploy Scenario</h1>
            <p className="text-[var(--muted)]">
              Deploy &quot;{selectedScenario.name}&quot; to a GNS3 server
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <DeployForm scenario={selectedScenario} onClose={handleBack} />
        </div>
      </div>
    );
  }

  // Scenario selection view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deploy Scenarios</h1>
        <p className="text-[var(--muted)]">
          Select a scenario to deploy to your GNS3 server
        </p>
      </div>

      <ScenarioList
        scenarios={scenarios}
        loading={loading}
        onDeploy={handleSelectScenario}
        readOnly
      />
    </div>
  );
}
