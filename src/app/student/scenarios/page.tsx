"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Layers, Eye, Edit } from "lucide-react";
import { useScenarios } from "../../hooks/useScenarios";
import { useTopologies } from "../../hooks/useTopologies";
import { useSettings } from "../../contexts/SettingsContext";
import ScenarioEditor from "../../components/ScenarioEditor";
import ScenarioView from "../../components/ScenarioView";
import { Scenario, ScenarioListItem, ProjectNode, ExecuteScriptRequest } from "../../types/scenario";

type View = "list" | "detail" | "edit";

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
  // Local edited scenario for student customization (not saved to backend)
  const [editedScenario, setEditedScenario] = useState<Scenario | null>(null);

  // Node loading state
  const [availableNodes, setAvailableNodes] = useState<ProjectNode[]>([]);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);
  const [nodeLoadError, setNodeLoadError] = useState<string | null>(null);

  // Load topologies on mount
  useEffect(() => {
    fetchTopologies();
  }, [fetchTopologies]);

  // Load nodes automatically when entering detail/edit view
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

  // Load nodes when view changes to detail or edit
  useEffect(() => {
    if (view === "detail" || view === "edit") {
      loadNodes();
    }
  }, [view, loadNodes]);

  const handleView = async (id: string) => {
    const scenario = await fetchScenario(id);
    if (scenario) {
      setSelectedScenario(scenario);
      setEditedScenario(scenario); // Initialize edited copy
      setView("detail");
    }
  };

  const handleEdit = () => {
    // Switch to edit mode with local copy
    setView("edit");
  };

  const handleBack = () => {
    if (view === "edit") {
      // Go back to detail view, keep edited scenario for running
      setView("detail");
    } else {
      setView("list");
      setSelectedScenario(null);
      setEditedScenario(null);
    }
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

  // Handle scenario changes from editor (for local edits)
  const handleScenarioChange = (updatedScenario: Scenario) => {
    setEditedScenario(updatedScenario);
  };

  // Edit View - Students can edit locally but cannot save
  if (view === "edit" && editedScenario) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Customize Scenario</h1>
            <p className="text-[var(--muted)]">
              Editing: {editedScenario.name} (changes are local only)
            </p>
          </div>
          <button
            onClick={() => setView("detail")}
            className="flex items-center gap-2 px-4 py-2 text-[var(--muted)] border border-[var(--border)] rounded-lg hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>

        <ScenarioEditor
          mode="edit"
          scenario={editedScenario}
          topologies={topologies}
          availableNodes={availableNodes}
          isLoadingNodes={isLoadingNodes}
          nodeLoadError={nodeLoadError}
          onExecuteScript={handleExecuteScript}
          onChange={handleScenarioChange}
          canSave={false} // Students cannot save to backend
        />
      </div>
    );
  }

  // Detail View - Using compact ScenarioView
  if (view === "detail" && (editedScenario || selectedScenario)) {
    const scenarioToShow = editedScenario || selectedScenario!;
    return (
      <ScenarioView
        scenario={scenarioToShow}
        onBack={handleBack}
        onEdit={handleEdit}
        onExecuteScript={handleExecuteScript}
      />
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
              className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 cursor-pointer transition-all hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/10 hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow cursor-pointer" onClick={() => handleView(scenario.id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-5 h-5 text-[var(--accent)]" />
                    <h3 className="font-medium group-hover:text-[var(--accent)] transition-colors">{scenario.name}</h3>
                  </div>
                  {scenario.description && (
                    <p className="text-sm text-[var(--muted)] mb-2">{scenario.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                    <span>{scenario.step_count || 0} steps</span>
                    <span>{scenario.script_count || 0} scripts</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(scenario.id);
                    }}
                    className="p-2 text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--input-bg)] rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
