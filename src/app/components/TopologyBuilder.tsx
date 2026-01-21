import React, { useState } from "react";

// Hooks
import { useTemplates } from "../hooks/useTemplates";
import { useTopologyConfig } from "../hooks/useTopologyConfig";
import { useTopologyOperations } from "../hooks/useTopologyOperations";
import { useTopologies } from "../hooks/useTopology";
import { useBuildScenario } from "../hooks/useBuild";
import { useScripts } from "../hooks/useScripts";

// Types
import { Project, ScriptAssignment } from "../types/topology";

// Components
import SavedTopologyList from "./SavedTopologyList";
import ProjectSelector from "./ProjectSelection";
import DeviceConfigurationSection from "./DeviceCountConfig";
import BuildPanel from "./BuildPanel";
import ScriptLibrary from "./ScriptLibrary";
import ScriptAssignmentComponent from "./ScriptAssignment";

const TopologyBuilder: React.FC = () => {
  // GNS3 Server configuration
  const [currentGns3Ip] = useState<string>(
    process.env.NEXT_PUBLIC_GNS3_IP || ""
  );

  // Project selection
  const [selectedProject, setSelectedProject] = useState<Project>({
    project_name: "",
    name: "",
  });

  // Build options
  const [startScenario, setStartScenario] = useState(true);
  const [runDefaultScripts, setRunDefaultScripts] = useState(true);
  const [autoAssignDhcp, setAutoAssignDhcp] = useState(false);

  // Save topology form
  const [topologyName, setTopologyName] = useState("");
  const [topologyDescription, setTopologyDescription] = useState("");

  // Script assignments
  const [scriptAssignments, setScriptAssignments] = useState<ScriptAssignment[]>([]);

  // Advanced mode toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Custom hooks
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
  } = useTemplates();

  const {
    itDevices,
    otDevices,
    firewallConfig,
    setFirewallConfig,
    updateDeviceCount,
    updateDeviceTemplate,
    removeDevice,
    addDevice,
  } = useTopologyConfig(templates);

  const { scripts } = useScripts();
  const { loading: saveLoading } = useTopologies();
  const { loading: buildLoading } = useBuildScenario();

  // Get all device types for script assignment
  const getDeviceTypes = (): string[] => {
    const types: string[] = [];
    itDevices.forEach((d) => {
      if (d.count > 0) types.push(d.name);
    });
    otDevices.forEach((d) => {
      if (d.count > 0) types.push(d.name);
    });
    if (firewallConfig.count > 0) types.push("Firewall");
    return types;
  };

  // Topology operations hook
  const {
    handleSaveJSON,
    handleLoadTopology,
    handleExportTopology,
    handleDownloadJSON,
    handleBuildScenario,
    buildStatus,
    buildMessage,
  } = useTopologyOperations({
    currentGns3Ip,
    setCurrentGns3Ip: () => {}, // Read-only now
    itDevices,
    otDevices,
    firewallConfig,
    setFirewallConfig,
    templates,
    selectedProject,
    setSelectedProject,
    updateDeviceCount,
    updateDeviceTemplate,
    scriptAssignments,
  });

  // Handle save action
  const handleSave = async () => {
    if (!topologyName.trim()) return;
    await handleSaveJSON(topologyName, topologyDescription);
  };

  // Handle build action
  const handleBuild = async () => {
    await handleBuildScenario({
      startScenario,
      runDefaultScripts,
      autoAssignDhcp,
    });
  };

  if (templatesLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-300">Loading...</div>
        </div>
      </div>
    );
  }

  if (templatesError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="text-red-400">Error: {templatesError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          GNS3 Scenario Builder
        </h1>
        <p className="text-gray-400">
          Configure network topologies, assign scripts, and deploy to GNS3
        </p>
      </div>

      {/* Project Selection */}
      <ProjectSelector
        project={selectedProject}
        setProject={setSelectedProject}
        compact={false}
      />

      {/* Topology Configuration Section */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-gray-300 uppercase tracking-wider mb-4">
          Topology Configuration
        </h2>
        <DeviceConfigurationSection
          itDevices={itDevices}
          otDevices={otDevices}
          firewallConfig={firewallConfig}
          setFirewallConfig={setFirewallConfig}
          updateDeviceCount={updateDeviceCount}
          updateDeviceTemplate={updateDeviceTemplate}
          removeDevice={removeDevice}
          addDevice={addDevice}
          templates={templates}
          showAdvanced={showAdvanced}
          toggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        />
      </section>

      {/* Scripts Section */}
      <section className="mb-8 space-y-4">
        <h2 className="text-lg font-medium text-gray-300 uppercase tracking-wider mb-4">
          Scripts
        </h2>
        
        {/* Script Library */}
        <ScriptLibrary />

        {/* Script Assignment */}
        <ScriptAssignmentComponent
          scripts={scripts}
          deviceTypes={getDeviceTypes()}
          assignments={scriptAssignments}
          onAssignmentsChange={setScriptAssignments}
        />
      </section>

      {/* Build & Deploy Section */}
      <section className="mb-8">
        <BuildPanel
          gns3ServerIp={currentGns3Ip}
          projectName={selectedProject.name}
          startScenario={startScenario}
          onStartScenarioChange={setStartScenario}
          autoAssignDhcp={autoAssignDhcp}
          onAutoAssignDhcpChange={setAutoAssignDhcp}
          runDefaultScripts={runDefaultScripts}
          onRunDefaultScriptsChange={setRunDefaultScripts}
          topologyName={topologyName}
          onTopologyNameChange={setTopologyName}
          topologyDescription={topologyDescription}
          onTopologyDescriptionChange={setTopologyDescription}
          onSave={handleSave}
          onBuild={handleBuild}
          onDownload={handleDownloadJSON}
          saveLoading={saveLoading}
          buildLoading={buildLoading}
          buildStatus={buildStatus}
          buildMessage={buildMessage}
        />
      </section>

      {/* Saved Topologies */}
      <section>
        <SavedTopologyList
          onLoad={handleLoadTopology}
          onExport={handleExportTopology}
        />
      </section>
    </div>
  );
};

export default TopologyBuilder;
