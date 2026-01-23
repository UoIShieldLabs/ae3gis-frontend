"use client";

import { useState } from "react";
import { Rocket, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { DeployScenarioRequest, DeployScenarioResponse, Scenario } from "../types/topology";
import { useDeploy } from "../hooks/useDeploy";

interface DeployFormProps {
  scenario: Scenario;
  onClose?: () => void;
}

export default function DeployForm({ scenario, onClose }: DeployFormProps) {
  const { deploy, loading, error, result, reset } = useDeploy();

  // Deploy configuration
  const [gns3ServerIp, setGns3ServerIp] = useState("");
  const [gns3ServerPort, setGns3ServerPort] = useState(80);
  const [username, setUsername] = useState("gns3");
  const [password, setPassword] = useState("gns3");
  const [startNodes, setStartNodes] = useState(true);
  const [runScripts, setRunScripts] = useState(true);
  const [priorityDelay, setPriorityDelay] = useState(3.0);
  const [projectNameOverride, setProjectNameOverride] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDeploy = async () => {
    if (!gns3ServerIp.trim()) {
      return;
    }

    const config: DeployScenarioRequest = {
      gns3_server_ip: gns3ServerIp,
      gns3_server_port: gns3ServerPort,
      username,
      password,
      start_nodes: startNodes,
      run_scripts: runScripts,
      priority_delay: priorityDelay,
    };

    if (projectNameOverride.trim()) {
      config.project_name = projectNameOverride;
    }

    await deploy(scenario.id, config);
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
        {result.scripts_executed.length > 0 && (
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
            onClick={() => reset()}
            className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            Deploy Again
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scenario Info */}
      <div className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg p-4">
        <h3 className="font-semibold mb-1">{scenario.name}</h3>
        {scenario.description && (
          <p className="text-sm text-[var(--muted)]">{scenario.description}</p>
        )}
        <p className="text-xs text-[var(--muted)] mt-2">
          Project: {scenario.definition.project_name} •{" "}
          {scenario.definition.nodes.length} nodes
        </p>
      </div>

      {/* GNS3 Server Configuration */}
      <div className="space-y-3">
        <div>
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

        <div className="grid grid-cols-3 gap-3">
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
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-[var(--border)]">
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">
                Project Name Override
              </label>
              <input
                type="text"
                value={projectNameOverride}
                onChange={(e) => setProjectNameOverride(e.target.value)}
                placeholder={scenario.definition.project_name}
                className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">
                Priority Delay (seconds)
              </label>
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
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDeploy}
          disabled={loading || !gns3ServerIp.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--success)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Rocket className="w-4 h-4" />
          )}
          {loading ? "Deploying..." : "Deploy Scenario"}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
