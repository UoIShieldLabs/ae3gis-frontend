import React from "react";
import { Play, Download, Save, Server, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface BuildPanelProps {
  // Server info (read-only display)
  gns3ServerIp: string;
  projectName: string;

  // Build options
  startScenario: boolean;
  onStartScenarioChange: (checked: boolean) => void;
  autoAssignDhcp: boolean;
  onAutoAssignDhcpChange: (checked: boolean) => void;
  runDefaultScripts: boolean;
  onRunDefaultScriptsChange: (checked: boolean) => void;

  // Save topology
  topologyName: string;
  onTopologyNameChange: (name: string) => void;
  topologyDescription: string;
  onTopologyDescriptionChange: (description: string) => void;

  // Actions
  onSave: () => void;
  onBuild: () => void;
  onDownload: () => void;

  // Loading states
  saveLoading: boolean;
  buildLoading: boolean;

  // Status
  buildStatus: "idle" | "success" | "error";
  buildMessage: string;
}

const BuildPanel: React.FC<BuildPanelProps> = ({
  gns3ServerIp,
  projectName,
  startScenario,
  onStartScenarioChange,
  autoAssignDhcp,
  onAutoAssignDhcpChange,
  runDefaultScripts,
  onRunDefaultScriptsChange,
  topologyName,
  onTopologyNameChange,
  topologyDescription,
  onTopologyDescriptionChange,
  onSave,
  onBuild,
  onDownload,
  saveLoading,
  buildLoading,
  buildStatus,
  buildMessage,
}) => {
  return (
    <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
      <h2 className="text-xl font-semibold text-gray-100 mb-6">
        Build & Deploy
      </h2>

      {/* Server Info */}
      <div className="mb-6 p-4 bg-[#252535] rounded-lg border border-[#3a3a4e]">
        <div className="flex items-center space-x-3">
          <Server className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-sm text-gray-400">Target Server</p>
            <p className="text-gray-200 font-medium">
              {gns3ServerIp || "Not configured"}
              {projectName && (
                <span className="text-gray-400 font-normal">
                  {" "}/ Project: {projectName}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Save Topology Section */}
      <div className="mb-6 space-y-4">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
          Save Configuration
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Topology Name
            </label>
            <input
              type="text"
              value={topologyName}
              onChange={(e) => onTopologyNameChange(e.target.value)}
              placeholder="e.g., IT-OT Network v1"
              disabled={saveLoading}
              className="w-full px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={topologyDescription}
              onChange={(e) => onTopologyDescriptionChange(e.target.value)}
              placeholder="Brief description..."
              disabled={saveLoading}
              className="w-full px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Build Options */}
      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
          Build Options
        </h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={startScenario}
              onChange={(e) => onStartScenarioChange(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-[#252535] border-[#3a3a4e] rounded focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
              Start nodes after creation
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={runDefaultScripts}
              onChange={(e) => onRunDefaultScriptsChange(e.target.checked)}
              disabled={!startScenario}
              className="w-4 h-4 text-indigo-600 bg-[#252535] border-[#3a3a4e] rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <span className={`transition-colors ${startScenario ? 'text-gray-300 group-hover:text-gray-100' : 'text-gray-500'}`}>
              Run assigned scripts after starting
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={autoAssignDhcp}
              onChange={(e) => onAutoAssignDhcpChange(e.target.checked)}
              disabled={!startScenario}
              className="w-4 h-4 text-indigo-600 bg-[#252535] border-[#3a3a4e] rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <span className={`transition-colors ${startScenario ? 'text-gray-300 group-hover:text-gray-100' : 'text-gray-500'}`}>
              Auto-assign IP addresses via DHCP
            </span>
          </label>
        </div>
      </div>

      {/* Status Message */}
      {buildStatus !== "idle" && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            buildStatus === "success"
              ? "bg-green-900/20 border-green-500/50"
              : "bg-red-900/20 border-red-500/50"
          }`}
        >
          <div className="flex items-center space-x-2">
            {buildStatus === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span
              className={
                buildStatus === "success" ? "text-green-400" : "text-red-400"
              }
            >
              {buildMessage}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onDownload}
          className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-gray-100 hover:bg-[#333347] rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download JSON</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={onSave}
            disabled={saveLoading || !topologyName.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#333347] text-gray-200 rounded-md hover:bg-[#3d3d52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Topology</span>
          </button>

          <button
            onClick={onBuild}
            disabled={buildLoading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {buildLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>{buildLoading ? "Building..." : "Build & Deploy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildPanel;
