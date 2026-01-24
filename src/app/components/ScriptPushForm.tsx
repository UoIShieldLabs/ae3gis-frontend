"use client";

import { useState, useEffect } from "react";
import { Terminal, Loader2, CheckCircle, XCircle, Plus, Trash2, AlertTriangle } from "lucide-react";
import { PushScriptRequest } from "../types/topology";
import { useScripts } from "../hooks/useScripts";
import { useSettings } from "../contexts/SettingsContext";

interface ScriptPushFormProps {
  gns3ServerIp?: string;
  projectId?: string;
}

interface PushConfig {
  nodeName: string;
  scriptId: string;
  remotePath: string;
  runAfterUpload: boolean;
}

interface PushResult {
  nodeName: string;
  scriptName: string;
  success: boolean;
  error?: string;
}

export default function ScriptPushForm({ gns3ServerIp: initialIp, projectId: initialProjectId }: ScriptPushFormProps) {
  const { scripts, loading: scriptsLoading } = useScripts();
  const { settings, isSettingsValid } = useSettings();

  // Pre-populate from settings
  const [gns3ServerIp, setGns3ServerIp] = useState(initialIp || settings.gns3ServerIp);
  const [gns3ServerPort, setGns3ServerPort] = useState(settings.gns3ServerPort);
  const [projectId, setProjectId] = useState(initialProjectId || "");

  // Push configurations
  const [pushConfigs, setPushConfigs] = useState<PushConfig[]>([
    { nodeName: "", scriptId: "", remotePath: settings.defaultScriptPath || "/tmp/script.sh", runAfterUpload: true },
  ]);

  // State
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PushResult[]>([]);

  // Sync with settings if they change
  useEffect(() => {
    if (!gns3ServerIp && settings.gns3ServerIp) {
      setGns3ServerIp(settings.gns3ServerIp);
    }
  }, [settings]);

  // Add a new push config
  const addPushConfig = () => {
    setPushConfigs([
      ...pushConfigs,
      { nodeName: "", scriptId: "", remotePath: "/tmp/script.sh", runAfterUpload: true },
    ]);
  };

  // Remove a push config
  const removePushConfig = (index: number) => {
    setPushConfigs(pushConfigs.filter((_, i) => i !== index));
  };

  // Update a push config
  const updatePushConfig = (index: number, field: keyof PushConfig, value: string | boolean) => {
    const newConfigs = [...pushConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setPushConfigs(newConfigs);
  };

  // Push scripts
  const handlePush = async () => {
    setError(null);
    setResults([]);

    // Validation
    if (!gns3ServerIp.trim()) {
      setError("GNS3 Server IP is required");
      return;
    }

    const validConfigs = pushConfigs.filter(
      (c) => c.nodeName.trim() && c.scriptId.trim()
    );

    if (validConfigs.length === 0) {
      setError("At least one node-script pair is required");
      return;
    }

    setPushing(true);

    try {
      const pushRequests: PushScriptRequest[] = validConfigs.map((c) => ({
        node_name: c.nodeName,
        script_id: c.scriptId,
        remote_path: c.remotePath,
        run_after_upload: c.runAfterUpload,
      }));

      const response = await fetch("/api/gns3/scripts/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gns3_server_ip: gns3ServerIp,
          gns3_server_port: gns3ServerPort,
          username: settings.gns3Username || "gns3",
          password: settings.gns3Password || "gns3",
          project_id: projectId || undefined,
          scripts: pushRequests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to push scripts");
      }

      const data = await response.json();
      
      // Map results
      const pushResults: PushResult[] = validConfigs.map((config, i) => {
        const script = scripts.find((s) => s.id === config.scriptId);
        return {
          nodeName: config.nodeName,
          scriptName: script?.name || config.scriptId,
          success: data.results?.[i]?.success ?? true,
          error: data.results?.[i]?.error,
        };
      });

      setResults(pushResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPushing(false);
    }
  };

  // Reset results
  const resetResults = () => {
    setResults([]);
    setError(null);
  };

  // Show results
  if (results.length > 0) {
    const allSuccess = results.every((r) => r.success);

    return (
      <div className="space-y-4">
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          allSuccess 
            ? "bg-[var(--success)]/10 border border-[var(--success)]"
            : "bg-[var(--danger)]/10 border border-[var(--danger)]"
        }`}>
          {allSuccess ? (
            <CheckCircle className="w-6 h-6 text-[var(--success)]" />
          ) : (
            <XCircle className="w-6 h-6 text-[var(--danger)]" />
          )}
          <div>
            <h3 className="font-semibold">
              {allSuccess ? "Scripts Pushed Successfully!" : "Some Scripts Failed"}
            </h3>
            <p className="text-sm text-[var(--muted)]">
              {results.filter((r) => r.success).length} of {results.length} scripts pushed
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {results.map((result, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-lg ${
                result.success ? "bg-[var(--success)]/5" : "bg-[var(--danger)]/5"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                ) : (
                  <XCircle className="w-4 h-4 text-[var(--danger)]" />
                )}
                <span className="font-medium">{result.nodeName}</span>
                <span className="text-[var(--muted)]">←</span>
                <span className="text-sm text-[var(--muted)]">{result.scriptName}</span>
              </div>
              {result.error && (
                <span className="text-xs text-[var(--danger)]">{result.error}</span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={resetResults}
          className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
        >
          Push More Scripts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Settings Hint */}
      {!isSettingsValid() && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500 rounded-lg text-amber-600 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Configure GNS3 settings in Settings tab to auto-fill these fields</span>
        </div>
      )}

      {/* Server Configuration */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
        <h3 className="font-semibold mb-3">GNS3 Server</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Server IP *
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
            <label className="block text-sm text-[var(--muted)] mb-1">
              Port
            </label>
            <input
              type="number"
              value={gns3ServerPort}
              onChange={(e) => setGns3ServerPort(parseInt(e.target.value) || 80)}
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Project ID (optional)
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Leave empty to auto-detect"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* Script Push Configurations */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Scripts to Push</h3>
          <button
            onClick={addPushConfig}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-3">
          {pushConfigs.map((config, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-end p-3 bg-[var(--input-bg)] rounded-lg"
            >
              <div className="col-span-3">
                <label className="block text-xs text-[var(--muted)] mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  value={config.nodeName}
                  onChange={(e) => updatePushConfig(index, "nodeName", e.target.value)}
                  placeholder="e.g., Client-1"
                  className="w-full px-2 py-1.5 text-sm bg-[var(--card-bg)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-[var(--muted)] mb-1">
                  Script
                </label>
                <select
                  value={config.scriptId}
                  onChange={(e) => updatePushConfig(index, "scriptId", e.target.value)}
                  disabled={scriptsLoading}
                  className="w-full px-2 py-1.5 text-sm bg-[var(--card-bg)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                  <option value="">Select script...</option>
                  {scripts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-[var(--muted)] mb-1">
                  Remote Path
                </label>
                <input
                  type="text"
                  value={config.remotePath}
                  onChange={(e) => updatePushConfig(index, "remotePath", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-[var(--card-bg)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              <div className="col-span-2 flex items-center">
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.runAfterUpload}
                    onChange={(e) => updatePushConfig(index, "runAfterUpload", e.target.checked)}
                    className="w-3 h-3 rounded"
                  />
                  Run
                </label>
              </div>
              <div className="col-span-1">
                {pushConfigs.length > 1 && (
                  <button
                    onClick={() => removePushConfig(index)}
                    className="p-1.5 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Push Button */}
      <button
        onClick={handlePush}
        disabled={pushing || !gns3ServerIp.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
      >
        {pushing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Terminal className="w-5 h-5" />
        )}
        {pushing ? "Pushing Scripts..." : "Push Scripts to Nodes"}
      </button>
    </div>
  );
}
