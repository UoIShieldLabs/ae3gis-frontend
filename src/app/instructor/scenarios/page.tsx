"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ArrowLeft, Layers, Trash2, Edit } from "lucide-react";
import { useScenarios } from "../../hooks/useScenarios";
import { useTopologies } from "../../hooks/useTopologies";
import { useSettings } from "../../contexts/SettingsContext";
import ScenarioEditor from "../../components/ScenarioEditor";
import { Scenario, ScenarioListItem, CreateScenarioRequest, UpdateScenarioRequest, ProjectNode, ExecuteScriptRequest } from "../../types/scenario";

type View = "list" | "create" | "edit" | "detail";

export default function InstructorScenariosPage() {
  const {
    scenarios,
    loading,
    error,
    fetchScenarios,
    fetchScenario,
    createScenario,
    updateScenario,
    deleteScenario,
    executeScript,
    fetchProjectNodes,
  } = useScenarios();

  const { topologies, fetchTopologies } = useTopologies();
  const { settings } = useSettings();

  const [view, setView] = useState<View>("list");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Node loading state
  const [availableNodes, setAvailableNodes] = useState<ProjectNode[]>([]);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);
  const [nodeLoadError, setNodeLoadError] = useState<string | null>(null);

  // Load topologies on mount
  useEffect(() => {
    fetchTopologies();
  }, [fetchTopologies]);

  // Load nodes automatically when entering create/edit/detail view
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

  // Load nodes when view changes to create/edit/detail
  useEffect(() => {
    if (view !== "list") {
      loadNodes();
    }
  }, [view, loadNodes]);

  const handleCreate = () => {
    setSelectedScenario(null);
    setView("create");
  };

  const handleView = async (id: string) => {
    const scenario = await fetchScenario(id);
    if (scenario) {
      setSelectedScenario(scenario);
      setView("detail");
    }
  };

  const handleEdit = async (id: string) => {
    const scenario = await fetchScenario(id);
    if (scenario) {
      setSelectedScenario(scenario);
      setView("edit");
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await deleteScenario(id);
      setDeleteConfirm(null);
      if (view === "detail" || view === "edit") {
        setView("list");
        setSelectedScenario(null);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleSave = async (data: CreateScenarioRequest | UpdateScenarioRequest): Promise<boolean> => {
    let result: Scenario | null = null;

    if (view === "edit" && selectedScenario?.id) {
      result = await updateScenario(selectedScenario.id, data as UpdateScenarioRequest);
    } else {
      result = await createScenario(data as CreateScenarioRequest);
    }

    if (result) {
      setView("list");
      setSelectedScenario(null);
      fetchScenarios();
      return true;
    }
    return false;
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

  const handleCancel = () => {
    setView("list");
    setSelectedScenario(null);
  };

  // Detail View (read-only)
  if (view === "detail" && selectedScenario) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("edit")}
              className="flex items-center gap-2 px-4 py-2 text-[var(--accent)] border border-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/10 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(selectedScenario.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                deleteConfirm === selectedScenario.id
                  ? "bg-[var(--danger)] text-white"
                  : "text-[var(--danger)] border border-[var(--danger)] hover:bg-[var(--danger)]/10"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {deleteConfirm === selectedScenario.id ? "Confirm" : "Delete"}
            </button>
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
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scenarios</h1>
            <p className="text-[var(--muted)]">
              Create lab scenarios with instructions and scripts
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Scenario
          </button>
        </div>

        {error && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {deleteConfirm && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)] px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-[var(--danger)]">
              Click delete again to confirm
            </span>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-[var(--muted)]">
            Loading scenarios...
          </div>
        ) : scenarios.length === 0 ? (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-12 text-center">
            <Layers className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scenarios Yet</h3>
            <p className="text-[var(--muted)] mb-4">
              Create your first scenario with instructions and scripts
            </p>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors"
            >
              Create Scenario
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {scenarios.map((scenario: ScenarioListItem) => (
              <div
                key={scenario.id}
                className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow cursor-pointer" onClick={() => handleView(scenario.id)}>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(scenario.id);
                      }}
                      className="p-2 text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--input-bg)] rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(scenario.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        deleteConfirm === scenario.id
                          ? "bg-[var(--danger)] text-white"
                          : "text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--input-bg)]"
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
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

  // Create/Edit View
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {view === "edit" ? "Edit Scenario" : "Create Scenario"}
          </h1>
          <p className="text-[var(--muted)]">
            {view === "edit"
              ? `Editing: ${selectedScenario?.name}`
              : "Build a scenario with instructions and scripts"}
          </p>
        </div>
      </div>

      <ScenarioEditor
        mode={view === "edit" ? "edit" : "create"}
        scenario={selectedScenario || undefined}
        topologies={topologies}
        availableNodes={availableNodes}
        isLoadingNodes={isLoadingNodes}
        nodeLoadError={nodeLoadError}
        onSave={handleSave}
        onExecuteScript={handleExecuteScript}
        canSave={true}
      />
    </div>
  );
}
