import { useState } from "react";
import { useTopologies } from "./useTopology";
import { useBuildScenario } from "./useBuild";
import { generateTopologyJSON, downloadJSON } from "../utils/topologyGenerator";
import { ScriptAssignment } from "../types/topology";

interface TopologyOperationsConfig {
  currentGns3Ip: string;
  itDevices: any[];
  otDevices: any[];
  firewallConfig: any;
  templates: any[];
  selectedProject: any;
  setCurrentGns3Ip: (ip: string) => void;
  setSelectedProject: (project: any) => void;
  updateDeviceCount: (name: string, count: number, isIT: boolean) => void;
  updateDeviceTemplate: (name: string, templateId: string, isIT: boolean) => void;
  setFirewallConfig: (value: any) => void;
  scriptAssignments: ScriptAssignment[];
}

interface BuildOptions {
  startScenario: boolean;
  runDefaultScripts: boolean;
  autoAssignDhcp: boolean;
}

export const useTopologyOperations = (config: TopologyOperationsConfig) => {
  // Call hooks INSIDE the custom hook
  const { createTopology, fetchTopologyById } = useTopologies();
  const { buildScenario } = useBuildScenario();

  const [buildStatus, setBuildStatus] = useState<"idle" | "success" | "error">("idle");
  const [buildMessage, setBuildMessage] = useState("");

  const saveActiveScenario = (scenarioData: any, scenarioName: string) => {
    const activeScenario = {
      name: scenarioName,
      nodes: scenarioData.nodes || [],
      gns3_server_ip: scenarioData.gns3_server_ip,
      project_id: scenarioData.project_id,
    };
    localStorage.setItem("activeScenario", JSON.stringify(activeScenario));
  };

  // Generate topology with script assignments
  const generateScenario = () => {
    return generateTopologyJSON(
      config.currentGns3Ip,
      config.itDevices,
      config.otDevices,
      config.firewallConfig,
      config.templates,
      config.selectedProject,
      config.scriptAssignments
    );
  };


  const handleSaveJSON = async (name: string, description: string) => {
    const scenario = generateScenario();

    try {
      const response = await createTopology(name, scenario, description);

      if (response) {
        const scenarioName = `${name} - ${new Date().toLocaleString()}`;
        saveActiveScenario(scenario, scenarioName);
        alert(`Topology "${name}" saved successfully!`);
      }
    } catch (err) {
      console.error("Failed to save topology:", err);
      alert("Failed to save topology. Please try again.");
    }
  };

  const handleLoadTopology = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Load topology "${name}"? This will replace your current configuration.`
    );

    if (!confirmed) return;

    try {
      const topology = await fetchTopologyById(id);
      const topologyData = topology.scenario;

      if (!topologyData || !topologyData.nodes) {
        throw new Error("Invalid topology data - missing nodes");
      }

      if (topologyData.gns3_server_ip) {
        config.setCurrentGns3Ip(topologyData.gns3_server_ip);
      }

      //if (topologyData.project_id) {
      //  const project = config.projects.find(
      //    (p) => p.project_id === topologyData.project_id
      //  );
      //  if (project) {
      //    config.setSelectedProject(project);
      //  }
      //}

      const deviceCounts = topologyData.nodes.reduce((acc: any, node: any) => {
        const deviceType = node.name.replace(/_\d+$/, "");
        const key = `${node.zone}-${deviceType}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Use config.itDevices instead of just itDevices
      config.itDevices.forEach((device) => {
        const count = deviceCounts[`IT-${device.name}`] || 0;
        config.updateDeviceCount(device.name, count, true);

        const nodeWithType = topologyData.nodes.find(
          (n: any) => n.zone === "IT" && n.name.startsWith(device.name)
        );
        if (nodeWithType?.template_id) {
          config.updateDeviceTemplate(device.name, nodeWithType.template_id, true);
        }
      });

      config.otDevices.forEach((device) => {
        const count = deviceCounts[`OT-${device.name}`] || 0;
        config.updateDeviceCount(device.name, count, false);

        const nodeWithType = topologyData.nodes.find(
          (n: any) => n.zone === "OT" && n.name.startsWith(device.name)
        );
        if (nodeWithType?.template_id) {
          config.updateDeviceTemplate(device.name, nodeWithType.template_id, false);
        }
      });

      const firewallCount = deviceCounts["DMZ-Firewall"] || 0;
      const firewallNode = topologyData.nodes.find((n: any) =>
        n.name.startsWith("Firewall")
      );

      config.setFirewallConfig((prev: any) => ({
        ...prev,
        count: firewallCount,
        ...(firewallNode?.template_id && {
          templateId: firewallNode.template_id,
        }),
      }));

      saveActiveScenario(topologyData, name);
      alert(`Successfully loaded topology: ${name}`);
    } catch (err) {
      console.error("Failed to load topology:", err);
      alert(
        `Failed to load topology: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleExportTopology = async (id: string) => {
    try {
      const topology = await fetchTopologyById(id);
      downloadJSON(topology.scenario);
    } catch (err) {
      console.error("Failed to export topology:", err);
      alert("Failed to export topology. Please try again.");
    }
  };

  const handleDownloadJSON = () => {
    const scenario = generateScenario();
    downloadJSON(scenario);
  };

  // Assign DHCP IPs after build
  const assignDhcpIps = async (scenario: any) => {
    try {
      // Find DHCP server nodes
      const dhcpServers = scenario.nodes
        .filter((n: any) => n.name.toLowerCase().includes("dhcp") && n.name.toLowerCase().includes("server"))
        .map((n: any) => n.name);

      // Find client nodes (workstations and other non-server, non-switch, non-firewall nodes)
      const clients = scenario.nodes
        .filter((n: any) => {
          const name = n.name.toLowerCase();
          return !name.includes("switch") && 
                 !name.includes("firewall") && 
                 !name.includes("server") &&
                 !name.includes("router");
        })
        .map((n: any) => n.name);

      if (dhcpServers.length === 0 || clients.length === 0) {
        console.log("No DHCP servers or clients found, skipping DHCP assignment");
        return;
      }

      const response = await fetch("/api/gns3/dhcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dhcp_server_nodes: dhcpServers,
          client_nodes: clients,
          gns3_server_ip: scenario.gns3_server_ip,
        }),
      });

      if (!response.ok) {
        console.error("DHCP assignment failed:", await response.text());
      }
    } catch (err) {
      console.error("DHCP assignment error:", err);
    }
  };

  // Build and deploy scenario (simplified - single server only)
  const handleBuildScenario = async (options: BuildOptions) => {
    setBuildStatus("idle");
    setBuildMessage("");

    const scenario = generateScenario();

    try {
      const response = await buildScenario(
        scenario,
        config.currentGns3Ip,
        options.startScenario,
        options.runDefaultScripts
      );

      if (response) {
        const scenarioName = `Built Scenario - ${new Date().toLocaleString()}`;
        saveActiveScenario(scenario, scenarioName);

        // Auto-assign DHCP if enabled
        if (options.autoAssignDhcp && options.startScenario) {
          setBuildMessage("Scenario built! Assigning DHCP IPs...");
          await assignDhcpIps(scenario);
        }

        setBuildStatus("success");
        setBuildMessage("Scenario built successfully! You can now interact with the nodes.");
        return true;
      } else {
        setBuildStatus("error");
        setBuildMessage("Failed to build scenario. Please check the console for details.");
        return false;
      }
    } catch (err) {
      console.error("Build scenario error:", err);
      setBuildStatus("error");
      setBuildMessage(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return false;
    }
  };

  // Legacy function for compatibility
  const handleBuildJSON = async () => {
    return handleBuildScenario({
      startScenario: true,
      runDefaultScripts: false,
      autoAssignDhcp: false,
    });
  };


  return {
    handleSaveJSON,
    handleLoadTopology,
    handleExportTopology,
    handleDownloadJSON,
    handleBuildJSON,
    handleBuildScenario,
    buildStatus,
    buildMessage,
    setBuildStatus,
    setBuildMessage,
  };
};