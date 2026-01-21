export type Template = {
  template_id: string;
  name: string;
};

export type DeviceConfig = {
  name: string;
  count: number;
  templateId: string;
  icon: React.ReactNode;
  description: string;
};

export type TopologyType = "IT" | "OT" | "HYBRID";

export type NetworkConfig = {
  type: TopologyType;
  devices: DeviceConfig[];
};

export type Node = {
  node_id: string;
  name: string;
  template_id: string;
  x: number;
  y: number;
  zone: string;
};

export type Link = {
  nodes: {
    node_id: string;
    adapter_number: number;
    port_number: number;
  }[];
};

export type DeviceType = {
  name: string;
  templateName: string;
  icon: React.ReactNode;
  description: string;
};

export type Project = {
  project_name: string;
  name: string;
};

// Script stored in backend
export type Script = {
  id: string;
  name: string;
  description?: string;
  content: string;
  created_at: string;
  updated_at: string;
};

// Script list item (without content)
export type ScriptListItem = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

// Script assignment for a device type (maps device types to scripts)
export type ScriptAssignment = {
  deviceType: string; // e.g., "DHCP_Server", "Workstation"
  scriptId: string;
  remotePath: string;
  priority: number;
};

// Default script attached to a node for build
export type DefaultScript = {
  script_id: string;
  remote_path: string;
  priority: number;
  shell?: string;
  timeout?: number;
};

// Extended Node with default_scripts
export type NodeWithScripts = Node & {
  default_scripts?: DefaultScript[];
};
