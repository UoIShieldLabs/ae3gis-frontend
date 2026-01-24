"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, AlertTriangle, Loader2, CheckCircle, Trash2 } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

interface SettingsFormProps {
  showResetProject?: boolean;
}

export default function SettingsForm({ showResetProject = true }: SettingsFormProps) {
  const { settings, updateSettings, resetSettings, isSettingsValid } = useSettings();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string } | null>(null);
  const [projectName, setProjectName] = useState("");

  // Pre-populate project name from settings
  useEffect(() => {
    if (settings.defaultProjectName && !projectName) {
      setProjectName(settings.defaultProjectName);
    }
  }, [settings.defaultProjectName, projectName]);

  const handleSave = () => {
    setSaving(true);
    // Settings are auto-saved via context, just show feedback
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 300);
  };

  const handleResetProject = async () => {
    if (!projectName.trim()) {
      setResetResult({ success: false, message: "Project name is required" });
      return;
    }

    if (!settings.gns3ServerIp.trim()) {
      setResetResult({ success: false, message: "GNS3 Server IP is required in settings" });
      return;
    }

    const confirmed = window.confirm(
      `This will delete ALL nodes and links in the project "${projectName}". This cannot be undone. Continue?`
    );
    if (!confirmed) return;

    setResetting(true);
    setResetResult(null);

    try {
      // First, get the project ID from the project name
      const projectsResponse = await fetch("/api/gns3/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gns3_server_ip: settings.gns3ServerIp,
          gns3_server_port: settings.gns3ServerPort,
          username: settings.gns3Username,
          password: settings.gns3Password,
        }),
      });

      if (!projectsResponse.ok) {
        throw new Error("Failed to fetch projects from GNS3 server");
      }

      const projects = await projectsResponse.json();
      const project = projects.find((p: { name: string; project_id: string }) => 
        p.name.toLowerCase() === projectName.trim().toLowerCase()
      );

      if (!project) {
        setResetResult({
          success: false,
          message: `Project "${projectName}" not found on GNS3 server`,
        });
        return;
      }

      // Now delete the nodes using the project ID
      const response = await fetch(`/api/scenarios/projects/${project.project_id}/nodes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gns3_server_ip: settings.gns3ServerIp,
          gns3_server_port: settings.gns3ServerPort,
          username: settings.gns3Username,
          password: settings.gns3Password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetResult({
          success: true,
          message: `Deleted ${data.nodes_deleted} nodes and ${data.links_deleted} links from "${projectName}"`,
        });
      } else {
        setResetResult({
          success: false,
          message: data.error || "Failed to reset project",
        });
      }
    } catch (error) {
      setResetResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to server",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* GNS3 Server Configuration */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">GNS3 Server Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Server IP Address *
            </label>
            <input
              type="text"
              value={settings.gns3ServerIp}
              onChange={(e) => updateSettings({ gns3ServerIp: e.target.value })}
              placeholder="e.g., 192.168.1.50"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Server Port
            </label>
            <input
              type="number"
              value={settings.gns3ServerPort}
              onChange={(e) => updateSettings({ gns3ServerPort: parseInt(e.target.value) || 80 })}
              placeholder="80"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Username
            </label>
            <input
              type="text"
              value={settings.gns3Username}
              onChange={(e) => updateSettings({ gns3Username: e.target.value })}
              placeholder="gns3"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={settings.gns3Password}
              onChange={(e) => updateSettings({ gns3Password: e.target.value })}
              placeholder="gns3"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* Default Values */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Default Values</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Default Project Name
            </label>
            <input
              type="text"
              value={settings.defaultProjectName}
              onChange={(e) => updateSettings({ defaultProjectName: e.target.value })}
              placeholder="e.g., my-lab"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Default Script Path
            </label>
            <input
              type="text"
              value={settings.defaultScriptPath}
              onChange={(e) => updateSettings({ defaultScriptPath: e.target.value })}
              placeholder="/tmp/script.sh"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Priority Delay (seconds)
            </label>
            <input
              type="number"
              value={settings.priorityDelay}
              onChange={(e) => updateSettings({ priorityDelay: parseFloat(e.target.value) || 3.0 })}
              min={0}
              step={0.5}
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* Reset Project Section */}
      {showResetProject && (
        <div className="bg-[var(--card-bg)] border border-[var(--danger)]/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
            Reset GNS3 Project
          </h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Delete all nodes and links from a GNS3 project. This cannot be undone.
          </p>

          <div className="flex gap-3 items-end">
            <div className="flex-grow">
              <label className="block text-sm text-[var(--muted)] mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--danger)]"
              />
            </div>
            <button
              onClick={handleResetProject}
              disabled={resetting || !projectName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--danger)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {resetting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete All Nodes
            </button>
          </div>

          {resetResult && (
            <div
              className={`mt-3 p-3 rounded-lg ${
                resetResult.success
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--danger)]/10 text-[var(--danger)]"
              }`}
            >
              {resetResult.message}
            </div>
          )}
        </div>
      )}

      {/* Validation Warning */}
      {!isSettingsValid() && (
        <div className="flex items-center gap-2 p-4 bg-[var(--danger)]/10 border border-[var(--danger)] rounded-lg text-[var(--danger)]">
          <AlertTriangle className="w-5 h-5" />
          <span>GNS3 Server IP is required to deploy scenarios</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (window.confirm("Reset all settings to defaults?")) {
              resetSettings();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
