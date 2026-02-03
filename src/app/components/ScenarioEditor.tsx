"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  FileCode,
  Save,
  Loader2,
  Layers,
} from "lucide-react";
import TextStep from "./TextStep";
import ScriptStep from "./ScriptStep";
import {
  ScenarioStep,
  MarkdownStep,
  ScriptStep as ScriptStepType,
  Scenario,
  CreateScenarioRequest,
  UpdateScenarioRequest,
  DEFAULT_MARKDOWN_STEP,
  DEFAULT_SCRIPT_STEP,
  ProjectNode,
  ExecuteScriptRequest,
} from "../types/scenario";
import { TopologyListItem } from "../types/topology";

interface ScenarioEditorProps {
  mode: "create" | "edit" | "view";
  scenario?: Scenario;
  topologies: TopologyListItem[];
  availableNodes: ProjectNode[];
  isLoadingNodes?: boolean;
  nodeLoadError?: string | null;
  onSave?: (data: CreateScenarioRequest | UpdateScenarioRequest) => Promise<boolean>;
  onExecuteScript?: (request: ExecuteScriptRequest) => Promise<unknown>;
  canSave?: boolean;
}

export default function ScenarioEditor({
  mode,
  scenario,
  topologies,
  availableNodes,
  isLoadingNodes = false,
  nodeLoadError,
  onSave,
  onExecuteScript,
  canSave = true,
}: ScenarioEditorProps) {
  // Scenario metadata
  const [name, setName] = useState(scenario?.name || "");
  const [description, setDescription] = useState(scenario?.description || "");
  const [defaultTopologyId, setDefaultTopologyId] = useState(scenario?.default_topology_id || "");

  // Steps
  const [steps, setSteps] = useState<ScenarioStep[]>(scenario?.steps || []);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pushingStepIndex, setPushingStepIndex] = useState<number | null>(null);

  const isReadOnly = mode === "view";

  // Reset when scenario changes
  useEffect(() => {
    if (scenario) {
      setName(scenario.name);
      setDescription(scenario.description || "");
      setDefaultTopologyId(scenario.default_topology_id || "");
      setSteps(scenario.steps || []);
    }
  }, [scenario]);

  // Add new step
  const addStep = (type: "markdown" | "script") => {
    if (type === "markdown") {
      setSteps([...steps, { type: "markdown", ...DEFAULT_MARKDOWN_STEP } as MarkdownStep]);
    } else {
      setSteps([...steps, { type: "script", ...DEFAULT_SCRIPT_STEP } as ScriptStepType]);
    }
  };

  // Update step
  const updateStep = (index: number, updatedStep: ScenarioStep) => {
    setSteps(steps.map((s, i) => (i === index ? updatedStep : s)));
  };

  // Remove step
  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave || !name.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const data: CreateScenarioRequest | UpdateScenarioRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        default_topology_id: defaultTopologyId || undefined,
        steps,
      };

      const success = await onSave(data);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle execute script
  const handleExecuteScript = async (stepIndex: number) => {
    if (!onExecuteScript) return;

    const step = steps[stepIndex];
    if (step.type !== "script") return;

    const scriptStep = step as ScriptStepType;
    if (!scriptStep.target_nodes?.length) return;

    setPushingStepIndex(stepIndex);

    try {
      // Build execute request matching /scenarios/execute endpoint
      const request: Partial<ExecuteScriptRequest> = {
        target_nodes: scriptStep.target_nodes,
        script_content: scriptStep.script_content,
        storage_path: scriptStep.storage_path || "/tmp/script.sh",
        shell: "sh",
        timeout: scriptStep.timeout || 5,
        run_after_upload: scriptStep.run_after_upload || false,
      };

      await onExecuteScript(request as ExecuteScriptRequest);
    } finally {
      setPushingStepIndex(null);
    }
  };

  // Get recommended topology name
  const getTopologyName = () => {
    if (!defaultTopologyId) return null;
    const topology = topologies.find((t) => t.id === defaultTopologyId);
    return topology?.name || null;
  };

  return (
    <div className="space-y-6">
      {/* Header / Metadata */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Scenario Name <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isReadOnly}
              placeholder="Enter scenario name"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-60"
            />
          </div>

          {/* Recommended Topology */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Recommended Topology
              <span className="text-xs text-[var(--muted)] ml-2">(optional)</span>
            </label>
            {isReadOnly ? (
              <div className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--muted)]">
                {getTopologyName() || "None selected"}
              </div>
            ) : (
              <select
                value={defaultTopologyId}
                onChange={(e) => setDefaultTopologyId(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              >
                <option value="">None</option>
                {topologies.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly}
              placeholder="Brief description of what this scenario covers..."
              rows={2}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-60 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Node Status */}
      {isLoadingNodes ? (
        <div className="flex items-center gap-2 text-sm text-[var(--muted)] px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading nodes from GNS3...
        </div>
      ) : nodeLoadError ? (
        <div className="text-sm text-[var(--danger)] px-4 py-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg">
          {nodeLoadError}
        </div>
      ) : availableNodes.length > 0 ? (
        <div className="flex items-center gap-2 text-sm text-[var(--muted)] px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
          <Layers className="w-4 h-4" />
          {availableNodes.length} node{availableNodes.length !== 1 ? "s" : ""} available
          <span className="text-xs">
            ({availableNodes.filter(n => n.status === "started").length} running)
          </span>
        </div>
      ) : null}

      {/* Steps */}
      <div className="space-y-4">
        {steps.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl">
            <Layers className="w-12 h-12 text-[var(--muted)] mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No Steps Yet</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Add instructions or scripts to build your scenario
            </p>
            {!isReadOnly && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => addStep("markdown")}
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--input-bg)] transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  Add Instructions
                </button>
                <button
                  onClick={() => addStep("script")}
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--input-bg)] transition-colors"
                >
                  <FileCode className="w-4 h-4 text-emerald-500" />
                  Add Script
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {steps.map((step, index) => (
              <div key={index}>
                {step.type === "markdown" ? (
                  <TextStep
                    step={step}
                    index={index}
                    onChange={(s) => updateStep(index, s)}
                    onRemove={() => removeStep(index)}
                    readOnly={isReadOnly}
                  />
                ) : (
                  <ScriptStep
                    step={step}
                    index={index}
                    onChange={(s) => updateStep(index, s)}
                    onRemove={() => removeStep(index)}
                    onPush={onExecuteScript ? () => handleExecuteScript(index) : undefined}
                    availableNodes={availableNodes}
                    readOnly={isReadOnly}
                    isPushing={pushingStepIndex === index}
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Add Step Buttons */}
      {!isReadOnly && steps.length > 0 && (
        <div className="flex items-center justify-center gap-3 py-4">
          <button
            onClick={() => addStep("markdown")}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--input-bg)] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <FileText className="w-4 h-4 text-blue-500" />
            Add Instructions
          </button>
          <button
            onClick={() => addStep("script")}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--input-bg)] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <FileCode className="w-4 h-4 text-emerald-500" />
            Add Script
          </button>
        </div>
      )}

      {/* Save Button */}
      {canSave && !isReadOnly && onSave && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div>
            {saveError && (
              <span className="text-sm text-[var(--danger)]">{saveError}</span>
            )}
            {saveSuccess && (
              <span className="text-sm text-green-500">Saved successfully!</span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Saving..." : "Save Scenario"}
          </button>
        </div>
      )}
    </div>
  );
}
