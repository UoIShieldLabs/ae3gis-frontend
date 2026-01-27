"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Square,
  Send,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { useLogging } from "../../hooks/useLogging";
import { useRouter } from "next/navigation";

export default function StudentTelemetryPage() {
  const router = useRouter();
  const { settings, getSanitizedStudentName } = useSettings();
  const studentName = getSanitizedStudentName();
  const { loading, error, status, preview, setupLogging, fetchStatus, fetchPreview, submitLogs, teardownLogging, clearError } = useLogging(studentName);

  const [activeTab, setActiveTab] = useState<"it" | "ot">("it");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Advanced options
  const [itSwitchName, setItSwitchName] = useState("IT-Switch");
  const [otSwitchName, setOtSwitchName] = useState("OT-Switch");
  const [syslogTemplate, setSyslogTemplate] = useState("syslog-collector");

  // Fetch status on mount
  useEffect(() => {
    if (studentName) {
      fetchStatus();
    }
  }, [studentName, fetchStatus]);

  const handleStartRecording = async () => {
    clearError();
    setMessage(null);
    setWarnings([]);

    if (!settings.defaultProjectName) {
      setMessage({ type: "error", text: "Please set a default project name in Settings" });
      return;
    }

    const result = await setupLogging({
      project_name: settings.defaultProjectName,
      gns3_server_ip: settings.gns3ServerIp,
      gns3_server_port: settings.gns3ServerPort,
      username: settings.gns3Username,
      password: settings.gns3Password,
      it_switch_name: itSwitchName,
      ot_switch_name: otSwitchName,
      syslog_template_name: syslogTemplate,
    });

    if (result) {
      setMessage({
        type: "success",
        text: `Recording started! Injected ${result.injected_node_count} nodes.`,
      });
      // Display any warnings from the API
      if (result.errors && result.errors.length > 0) {
        setWarnings(result.errors);
      }
    }
  };

  const handleStopRecording = async () => {
    clearError();
    setMessage(null);
    setWarnings([]);

    const confirmed = window.confirm(
      "Stop recording and remove collectors? You can still submit logs before stopping."
    );
    if (!confirmed) return;

    const result = await teardownLogging({
      gns3_server_ip: settings.gns3ServerIp,
      gns3_server_port: settings.gns3ServerPort,
      username: settings.gns3Username,
      password: settings.gns3Password,
    });

    if (result) {
      setMessage({
        type: "success",
        text: `Recording stopped. Removed ${result.removed_nodes.length} collector nodes.`,
      });
    }
  };

  const handleRefreshLogs = async () => {
    clearError();
    setMessage(null);
    setWarnings([]);

    const result = await fetchPreview({
      gns3_server_ip: settings.gns3ServerIp,
      gns3_server_port: settings.gns3ServerPort,
      username: settings.gns3Username,
      password: settings.gns3Password,
    });

    // Display any warnings from the API
    if (result && result.errors && result.errors.length > 0) {
      setWarnings(result.errors);
    }
  };

  const handleSubmitLogs = async () => {
    clearError();
    setMessage(null);
    setWarnings([]);

    const confirmed = window.confirm("Submit your current logs for grading?");
    if (!confirmed) return;

    const result = await submitLogs({
      gns3_server_ip: settings.gns3ServerIp,
      gns3_server_port: settings.gns3ServerPort,
      username: settings.gns3Username,
      password: settings.gns3Password,
    });

    if (result) {
      setMessage({
        type: "success",
        text: `Logs submitted! Submission ID: ${result.submission_id} (${result.it_log_lines} IT lines, ${result.ot_log_lines} OT lines)`,
      });
      // Display any warnings from the API
      if (result.errors && result.errors.length > 0) {
        setWarnings(result.errors);
      }
    }
  };

  // Show prompt if no student name
  if (!settings.studentName) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Telemetry Recording</h1>
          <p className="text-[var(--muted)] mt-1">Record your activity for grading</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[var(--warning)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Student Name Required</h2>
          <p className="text-[var(--muted)] mb-6">
            Please enter your name in Settings before using telemetry recording.
          </p>
          <button
            onClick={() => router.push("/student/settings")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Settings className="w-4 h-4" />
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  const isActive = status?.is_active ?? false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Telemetry Recording</h1>
        <p className="text-[var(--muted)] mt-1">
          Record your activity for grading • Student: <span className="font-medium text-[var(--foreground)]">{settings.studentName}</span> ({studentName})
        </p>
      </div>

      {/* Status & Messages */}
      {(error || message) && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            error || message?.type === "error"
              ? "bg-red-500/10 border border-red-500/30"
              : "bg-green-500/10 border border-green-500/30"
          }`}
        >
          {error || message?.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          )}
          <p className={error || message?.type === "error" ? "text-red-500" : "text-green-500"}>
            {error || message?.text}
          </p>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex-grow">
              <p className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                {warnings.length} Warning{warnings.length !== 1 ? "s" : ""}
              </p>
              <ul className="space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-yellow-600 dark:text-yellow-400">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            <span className="font-medium">
              {isActive ? "Recording Active" : "Recording Inactive"}
            </span>
            {status?.project_name && (
              <span className="text-sm text-[var(--muted)]">
                • Project: {status.project_name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isActive ? (
              <button
                onClick={handleStartRecording}
                disabled={loading || !settings.gns3ServerIp}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={handleSubmitLogs}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Logs
                </button>
                <button
                  onClick={handleStopRecording}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="border-t border-[var(--border)] pt-4 mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">IT Switch Name</label>
                <input
                  type="text"
                  value={itSwitchName}
                  onChange={(e) => setItSwitchName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">OT Switch Name</label>
                <input
                  type="text"
                  value={otSwitchName}
                  onChange={(e) => setOtSwitchName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Syslog Template</label>
                <input
                  type="text"
                  value={syslogTemplate}
                  onChange={(e) => setSyslogTemplate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Preview */}
      {isActive && (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold">Log Preview</h3>
            <button
              onClick={handleRefreshLogs}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--border)]">
            <button
              onClick={() => setActiveTab("it")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "it"
                  ? "bg-[var(--input-bg)] border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              IT Logs
            </button>
            <button
              onClick={() => setActiveTab("ot")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "ot"
                  ? "bg-[var(--input-bg)] border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              OT Logs
            </button>
          </div>

          {/* Log Content */}
          <div className="p-4">
            {/* Preview Warnings */}
            {preview?.errors && preview.errors.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    {preview.errors.map((warning, idx) => (
                      <div key={idx}>• {warning}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {preview ? (
              <pre className="text-sm font-mono bg-[var(--input-bg)] p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                {activeTab === "it" ? preview.it_logs || "(No IT logs yet)" : preview.ot_logs || "(No OT logs yet)"}
              </pre>
            ) : (
              <p className="text-[var(--muted)] text-center py-8">
                Click &quot;Refresh&quot; to load logs
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
