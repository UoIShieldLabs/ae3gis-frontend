"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Layers } from "lucide-react";
import { useScenarios } from "../../hooks/useScenarios";
import { useTopologies } from "../../hooks/useTopologies";
import { useSettings } from "../../contexts/SettingsContext";
import ScenarioEditor from "../../components/ScenarioEditor";
import { Scenario, ScenarioListItem, ProjectNode, ExecuteScriptRequest } from "../../types/scenario";

type View = "list" | "detail";

export default function StudentScenariosPage() {
  const {
    scenarios,
    loading,
    error,
    fetchScenarios,
    fetchScenario,
    executeScript,
    fetchProjectNodes,
  } = useScenarios();

  const { topologies, fetchTopologies } = useTopologies();
  const { settings } = useSettings();

  const [view, setView] = useState<View>("list");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // Node loading state
  const [availableNodes, setAvailableNodes] = useState<ProjectNode[]>([]);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);
  const [nodeLoadError, setNodeLoadError] = useState<string | null>(null);

  // Load topologies on mount
  useEffect(() => {
    fetchTopologies();
  }, [fetchTopologies]);

  // Load nodes automatically when entering detail view
  const loadNodes = useCallback(async () => {
    if (!settings.gns3ServerIp || !settings.defaultProjectName) {
      setNodeLoadError("Configure GNS3 server and project name in Settings");
      return;
    }

    setIsLoadingNodes(true);
    setNodeLoadError(null);

    try {
      const result = await fetchProjectNodes(
        settings.defaultProjectName,
        settings.gns3ServerIp,
        settings.gns3ServerPort,
        settings.gns3Username,
        settings.gns3Password
      );
      if (result?.nodes) {
        setAvailableNodes(result.nodes);
      } else {
        setAvailableNodes([]);
      }
    } catch {
      setNodeLoadError("Failed to load nodes from GNS3");
      setAvailableNodes([]);
    } finally {
      setIsLoadingNodes(false);
    }
  }, [settings, fetchProjectNodes]);

  // Load nodes when view changes to detail
  useEffect(() => {
    if (view === "detail") {
      loadNodes();
    }
  }, [view, loadNodes]);

  const handleView = async (id: string) => {
    const scenario = await fetchScenario(id);
    if (scenario) {
      setSelectedScenario(scenario);
      setView("detail");
    }
  };

  const handleBack = () => {
    setView("list");
    setSelectedScenario(null);
  };

  const handleExecuteScript = async (request: ExecuteScriptRequest) => {
    // Add server config to request
    const fullRequest: ExecuteScriptRequest = {
      ...request,
      gns3_server_ip: settings.gns3ServerIp,
      gns3_server_port: settings.gns3ServerPort,
      username: settings.gns3Username,
      password: settings.gns3Password,
      project_name: settings.defaultProjectName,
    };
    return executeScript(fullRequest);
  };

  // Detail View (read-only with execution)
  if (view === "detail" && selectedScenario) {
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
              <Layers className="w-6 h-6 text-[var(--accent)]" />
              <h1 className="text-2xl font-bold">{selectedScenario.name}</h1>
            </div>
            {selectedScenario.description && (
              <p className="text-[var(--muted)] mt-1">{selectedScenario.description}</p>
            )}
          </div>
        </div>

        <ScenarioEditor
          mode="view"
          scenario={selectedScenario}
          topologies={topologies}
          availableNodes={availableNodes}
          isLoadingNodes={isLoadingNodes}
          nodeLoadError={nodeLoadError}
          onExecuteScript={handleExecuteScript}
        />
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scenarios</h1>
        <p className="text-[var(--muted)]">
          Browse and work through lab scenarios with step-by-step instructions
        </p>
      </div>

      {error && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">
          Loading scenarios...
        </div>
      ) : scenarios.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-12 text-center">
          <Layers className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Scenarios Available</h3>
          <p className="text-[var(--muted)]">
            Check back later for available lab scenarios
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scenarios.map((scenario: ScenarioListItem) => (
            <div
              key={scenario.id}
              onClick={() => handleView(scenario.id)}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-5 h-5 text-[var(--accent)]" />
                    <h3 className="font-medium">{scenario.name}</h3>
                  </div>
                  {scenario.description && (
                    <p className="text-sm text-[var(--muted)] mb-2">{scenario.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                    <span>{scenario.step_count || 0} steps</span>
                    <span>{scenario.script_count || 0} scripts</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
