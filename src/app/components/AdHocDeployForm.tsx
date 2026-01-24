"use client";

import { useState } from "react";
import {
  Rocket,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { Scenario, ScenarioDefinition, DeployScenarioResponse } from "../types/topology";
import { useSettings } from "../contexts/SettingsContext";
import ScenarioDetailView from "./ScenarioDetailView";

interface AdHocDeployFormProps {
  scenario: Scenario;
  onBack?: () => void;
  readOnly?: boolean;
}

export default function AdHocDeployForm({ scenario, onBack, readOnly = false }: AdHocDeployFormProps) {
  const { settings, isSettingsValid } = useSettings();

  // Editable definition
  const [definition, setDefinition] = useState<ScenarioDefinition>(scenario.definition);

  // Deploy configuration (pre-populated from settings)
  const [gns3ServerIp, setGns3ServerIp] = useState(settings.gns3ServerIp);
  const [gns3ServerPort, setGns3ServerPort] = useState(settings.gns3ServerPort);
  const [username, setUsername] = useState(settings.gns3Username || "gns3");
  const [password, setPassword] = useState(settings.gns3Password || "gns3");
  const [startNodes, setStartNodes] = useState(true);
  const [runScripts, setRunScripts] = useState(true);
  const [priorityDelay, setPriorityDelay] = useState(settings.priorityDelay);

  const [showAdvanced, setShowAdvanced] = useState(false);

  // State
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeployScenarioResponse | null>(null);

  const handleDeploy = async () => {
    if (!gns3ServerIp.trim()) {
      setError("GNS3 Server IP is required");
      return;
    }

    setDeploying(true);
    setError(null);

    try {
      const response = await fetch("/api/scenarios/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gns3_server_ip: gns3ServerIp,
          gns3_server_port: gns3ServerPort,
          username,
          password,
          start_nodes: startNodes,
          run_scripts: runScripts,
          priority_delay: priorityDelay,
          definition,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || "Failed to deploy scenario");
      }

      const data: DeployScenarioResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDeploying(false);
    }
  };

  const resetResult = () => {
    setResult(null);
    setError(null);
  };

  // Show result screen
  if (result) {
    return (
      <div className="space-y-4">
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          result.success 
            ? "bg-[var(--success)]/10 border border-[var(--success)]"
            : "bg-[var(--danger)]/10 border border-[var(--danger)]"
        }`}>
          {result.success ? (
            <CheckCircle className="w-6 h-6 text-[var(--success)]" />
          ) : (
            <XCircle className="w-6 h-6 text-[var(--danger)]" />
          )}
          <div>
            <h3 className="font-semibold">
              {result.success ? "Deployment Successful!" : "Deployment Failed"}
            </h3>
            <p className="text-sm text-[var(--muted)]">
              {result.success
                ? `Created ${result.nodes_created} nodes and ${result.links_created} links`
                : result.errors.join(", ")}
            </p>
          </div>
        </div>

        {/* Deployment Summary */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <h4 className="font-medium mb-3">Deployment Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[var(--muted)]">GNS3 Server:</span>
              <span className="ml-2">{result.gns3_server_ip}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Project:</span>
              <span className="ml-2">{result.project_name}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Nodes Created:</span>
              <span className="ml-2">{result.nodes_created}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Links Created:</span>
              <span className="ml-2">{result.links_created}</span>
            </div>
          </div>
        </div>

        {/* Script Execution Results */}
        {result.scripts_executed && result.scripts_executed.length > 0 && (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
            <h4 className="font-medium mb-3">Script Execution</h4>
            <div className="space-y-2">
              {result.scripts_executed.map((script, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded ${
                    script.success ? "bg-[var(--success)]/5" : "bg-[var(--danger)]/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {script.success ? (
                      <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--danger)]" />
                    )}
                    <span className="text-sm font-medium">{script.node_name}</span>
                    <span className="text-sm text-[var(--muted)]">{script.script_name}</span>
                  </div>
                  <span className="text-xs text-[var(--muted)]">
                    Priority: {script.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={resetResult}
            className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            Deploy Again
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Back to List
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scenario Detail View - Editable */}
      <ScenarioDetailView
        scenario={{ ...scenario, definition }}
        onDefinitionChange={readOnly ? undefined : setDefinition}
        readOnly={readOnly}
      />

      {/* Deploy Configuration */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-[var(--success)]" />
          <h2 className="text-lg font-semibold">Deploy Configuration</h2>
        </div>

        {/* Settings Hint */}
        {!isSettingsValid() && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-amber-500/10 border border-amber-500 rounded-lg text-amber-600 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Configure GNS3 settings in Settings tab to auto-fill these fields</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Server Config */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-[var(--muted)] mb-1">
                GNS3 Server IP *
              </label>
              <input
                type="text"
                value={gns3ServerIp}
                onChange={(e) => setGns3ServerIp(e.target.value)}
                placeholder="e.g., 192.168.1.50"
                className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Port</label>
              <input
                type="number"
                value={gns3ServerPort}
                onChange={(e) => setGns3ServerPort(parseInt(e.target.value) || 80)}
                className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Priority Delay</label>
              <input
                type="number"
                value={priorityDelay}
                onChange={(e) => setPriorityDelay(parseFloat(e.target.value) || 3)}
                min={0}
                step={0.5}
                className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={startNodes}
                onChange={(e) => setStartNodes(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm">Start nodes after creation</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={runScripts}
                onChange={(e) => setRunScripts(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm">Run startup scripts</span>
            </label>
          </div>

          {/* Advanced Options */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Authentication
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-[var(--border)]">
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Deploy Button */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDeploy}
            disabled={deploying || !gns3ServerIp.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--success)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {deploying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Rocket className="w-5 h-5" />
            )}
            {deploying ? "Deploying..." : "Deploy Scenario"}
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-3 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
