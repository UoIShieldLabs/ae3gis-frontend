import { DeviceConfig, Node, Link, Template, Project, ScriptAssignment, DefaultScript } from "../types/topology";

// Node with scripts for internal use
interface NodeWithScripts extends Node {
  default_scripts?: DefaultScript[];
}

// Configuration constants - aligned with positionCalculator.ts
// GNS3 uses screen coordinates: positive Y = down, negative Y = up
const LAYOUT_CONFIG = {
  // Switch positions (IT at top = negative Y, OT at bottom = positive Y)
  IT_SWITCH_Y: -150,       // Between IT layer and center
  OT_SWITCH_Y: 150,        // Between center and OT layer
  SWITCH_SPACING: 400,
  DEVICE_SPACING_X: 120,
  DEVICE_SPACING_Y: 70,
  IT_DEVICE_OFFSET_Y: -100,  // IT devices go UP (more negative)
  OT_DEVICE_OFFSET_Y: 100,   // OT devices go DOWN (more positive)
  IT_GRID_COLUMNS: 2,
  OT_GRID_ROWS: 2,
  BOUNDS: {
    IT: { X_MIN: -1000, X_MAX: 945, Y_MIN: -600, Y_MAX: -100 },  // Negative Y range for IT
    OT: { X_MIN: -1000, X_MAX: 945, Y_MIN: 100, Y_MAX: 600 },    // Positive Y range for OT
  },
} as const;

export const generatePositions = (
  deviceCount: number,
  zone: "IT" | "OT" | "DMZ"
) => {
  const positions = [];
  if (zone === "DMZ") {
    positions.push({ x: 0, y: 0 });
    return positions;
  }
  for (let i = 0; i < deviceCount; i++) {
    positions.push({ x: 0, y: 0 });
  }
  return positions;
};

const positionDevicesInGrid = (
  devices: Node[],
  switches: Node[],
  isITZone: boolean,
  positionedNodes: Node[]
) => {
  if (devices.length === 0 || switches.length === 0) return;

  const devicesPerSwitch = Math.ceil(devices.length / switches.length);
  const { DEVICE_SPACING_X, DEVICE_SPACING_Y, SWITCH_SPACING } = LAYOUT_CONFIG;

  // IT devices go UP (negative Y direction), OT devices go DOWN (positive Y direction)
  const gridConfig = isITZone
    ? {
        columns: LAYOUT_CONFIG.IT_GRID_COLUMNS,
        baseY: LAYOUT_CONFIG.IT_SWITCH_Y + LAYOUT_CONFIG.IT_DEVICE_OFFSET_Y,
        yDirection: -1,  // Additional rows go up (more negative)
      }
    : {
        columns: Math.ceil(devicesPerSwitch / LAYOUT_CONFIG.OT_GRID_ROWS),
        baseY: LAYOUT_CONFIG.OT_SWITCH_Y + LAYOUT_CONFIG.OT_DEVICE_OFFSET_Y,
        yDirection: 1,   // Additional rows go down (more positive)
      };

  devices.forEach((device, index) => {
    const nodeIndex = positionedNodes.findIndex(
      (n) => n.node_id === device.node_id
    );
    if (nodeIndex === -1) return;

    const switchGroup = Math.floor(index / devicesPerSwitch);
    const positionInGroup = index % devicesPerSwitch;
    const row = Math.floor(positionInGroup / gridConfig.columns);
    const col = positionInGroup % gridConfig.columns;

    const switchX = switches[switchGroup]
      ? (switchGroup - (switches.length - 1) / 2) * SWITCH_SPACING
      : 0;

    // Calculate X offset based on switch position
    const isEdgeSwitch =
      switches.length > 1 &&
      (switchGroup === 0 || switchGroup === switches.length - 1);
    const xOffset = isEdgeSwitch
      ? (switchGroup === 0 ? -(gridConfig.columns - col) : col + 1) *
        DEVICE_SPACING_X
      : (col - (gridConfig.columns - 1) / 2) * DEVICE_SPACING_X;

    const x = switchX + xOffset;
    const y = gridConfig.baseY + (row * DEVICE_SPACING_Y * gridConfig.yDirection);

    // Apply bounds
    const bounds = isITZone ? LAYOUT_CONFIG.BOUNDS.IT : LAYOUT_CONFIG.BOUNDS.OT;
    const clampedX = Math.max(bounds.X_MIN, Math.min(bounds.X_MAX, x));
    const clampedY = Math.max(bounds.Y_MIN, Math.min(bounds.Y_MAX, y));

    positionedNodes[nodeIndex] = { ...device, x: clampedX, y: clampedY };
  });
};

export const calculateHierarchicalPositions = (nodes: Node[]): Node[] => {
  const positionedNodes = [...nodes];

  // Categorize nodes
  const nodesByType = {
    firewalls: nodes.filter((n) => n.zone === "DMZ"),
    itSwitches: nodes.filter(
      (n) => n.zone === "IT" && n.name.toLowerCase().includes("switch")
    ),
    otSwitches: nodes.filter(
      (n) => n.zone === "OT" && n.name.toLowerCase().includes("switch")
    ),
    itDevices: nodes.filter(
      (n) => n.zone === "IT" && !n.name.toLowerCase().includes("switch")
    ),
    otDevices: nodes.filter(
      (n) => n.zone === "OT" && !n.name.toLowerCase().includes("switch")
    ),
  };

  // Position firewall at center
  nodesByType.firewalls.forEach((firewall) => {
    const idx = positionedNodes.findIndex(
      (n) => n.node_id === firewall.node_id
    );
    if (idx !== -1) positionedNodes[idx] = { ...firewall, x: 0, y: 0 };
  });

  // Position switches
  const positionSwitches = (switches: Node[], yPos: number) => {
    switches.forEach((sw, index) => {
      const idx = positionedNodes.findIndex((n) => n.node_id === sw.node_id);
      if (idx !== -1) {
        const x =
          (index - (switches.length - 1) / 2) * LAYOUT_CONFIG.SWITCH_SPACING;
        positionedNodes[idx] = { ...sw, x, y: yPos };
      }
    });
  };

  positionSwitches(nodesByType.itSwitches, LAYOUT_CONFIG.IT_SWITCH_Y);
  positionSwitches(nodesByType.otSwitches, LAYOUT_CONFIG.OT_SWITCH_Y);

  // Position devices
  positionDevicesInGrid(
    nodesByType.itDevices,
    nodesByType.itSwitches,
    true,
    positionedNodes
  );
  positionDevicesInGrid(
    nodesByType.otDevices,
    nodesByType.otSwitches,
    false,
    positionedNodes
  );

  return positionedNodes;
};

const connectDevicesToSwitches = (
  devices: Node[],
  switches: Node[],
  links: Link[]
) => {
  if (switches.length === 0) return;

  const devicesPerSwitch = Math.ceil(devices.length / switches.length);

  devices.forEach((device, index) => {
    const switchIndex = Math.floor(index / devicesPerSwitch);
    const targetSwitch = switches[Math.min(switchIndex, switches.length - 1)];
    const portOnSwitch = (index % devicesPerSwitch) + 1;

    links.push({
      nodes: [
        { node_id: device.node_id, adapter_number: 0, port_number: 0 },
        {
          node_id: targetSwitch.node_id,
          adapter_number: portOnSwitch,
          port_number: 0,
        },
      ],
    });
  });
};

export const generateBasicLinks = (nodes: Node[]): Link[] => {
  const links: Link[] = [];

  // Categorize nodes
  const itSwitches = nodes.filter(
    (n) => n.zone === "IT" && n.name.toLowerCase().includes("switch")
  );
  const otSwitches = nodes.filter(
    (n) => n.zone === "OT" && n.name.toLowerCase().includes("switch")
  );
  const firewalls = nodes.filter(
    (n) => n.zone === "DMZ" && n.name.toLowerCase().includes("firewall")
  );
  const itDevices = nodes.filter(
    (n) => n.zone === "IT" && !n.name.toLowerCase().includes("switch")
  );
  const otDevices = nodes.filter(
    (n) => n.zone === "OT" && !n.name.toLowerCase().includes("switch")
  );

  // Connect devices to switches
  connectDevicesToSwitches(itDevices, itSwitches, links);
  connectDevicesToSwitches(otDevices, otSwitches, links);

  // Connect all switches to firewall
  if (firewalls.length > 0) {
    const firewall = firewalls[0];
    let firewallPort = 0;

    [...itSwitches, ...otSwitches].forEach((sw) => {
      links.push({
        nodes: [
          { node_id: sw.node_id, adapter_number: 0, port_number: 0 },
          {
            node_id: firewall.node_id,
            adapter_number: firewallPort,
            port_number: 0,
          },
        ],
      });
      firewallPort++;
    });
  }

  return links;
};

export const generateTopologyJSON = (
  currentIP: string,
  itDevices: DeviceConfig[],
  otDevices: DeviceConfig[],
  firewallConfig: DeviceConfig,
  templates: Template[],
  selectedProject: Project | null,
  scriptAssignments: ScriptAssignment[] = []
) => {
  const nodes: NodeWithScripts[] = [];

  // Extract GNS3 server IP
  const gns3Url = currentIP;
  const gns3ServerIp = gns3Url
    .replace(/^https?:\/\//, "")
    .replace(/:\d+.*$/, "");

  // Helper to get scripts for a device type
  const getScriptsForDeviceType = (deviceName: string): DefaultScript[] => {
    return scriptAssignments
      .filter((a) => a.deviceType === deviceName)
      .map((a) => ({
        script_id: a.scriptId,
        remote_path: a.remotePath,
        priority: a.priority,
      }));
  };

  // Helper to add devices
  const addDevices = (devices: DeviceConfig[], zone: "IT" | "OT") => {
    devices.forEach((device) => {
      if (device.count > 0) {
        const scripts = getScriptsForDeviceType(device.name);
        for (let i = 0; i < device.count; i++) {
          const node: NodeWithScripts = {
            node_id: `${device.name}_${i + 1}`,
            name: `${device.name}_${i + 1}`,
            template_id: device.templateId,
            x: 0,
            y: 0,
            zone: zone,
          };
          if (scripts.length > 0) {
            node.default_scripts = scripts;
          }
          nodes.push(node);
        }
      }
    });
  };

  // Add all devices
  addDevices(itDevices, "IT");
  addDevices(otDevices, "OT");

  // Add firewall
  if (firewallConfig.count > 0) {
    const firewallScripts = getScriptsForDeviceType("Firewall");
    for (let i = 0; i < firewallConfig.count; i++) {
      const node: NodeWithScripts = {
        node_id: `Firewall_${i + 1}`,
        name: `Firewall_${i + 1}`,
        template_id: firewallConfig.templateId,
        x: 0,
        y: 0,
        zone: "DMZ",
      };
      if (firewallScripts.length > 0) {
        node.default_scripts = firewallScripts;
      }
      nodes.push(node);
    }
  }

  // Calculate positions and generate links
  const positionedNodes = calculateHierarchicalPositions(nodes);
  const links = generateBasicLinks(positionedNodes);

  // Build templates object
  const templatesObj: Record<string, string> = {};
  templates.forEach((template) => {
    templatesObj[template.name] = template.template_id;
  });

  return {
    gns3_server_ip: gns3ServerIp,
    project_name: selectedProject?.project_name,
    //project_id: selectedProject?.project_id,
    templates: templatesObj,
    topology_type: "HYBRID",
    created_at: new Date().toISOString(),
    nodes: positionedNodes,
    links,
  };
};

export const downloadJSON = (jsonData: any) => {
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scenario.json`;
  a.click();
  URL.revokeObjectURL(url);
};
