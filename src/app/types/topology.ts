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

// Script stored in backend (standalone)
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

// ============================================
// NEW SCENARIO-CENTRIC TYPES
// ============================================

// Embedded script in a scenario node
export type EmbeddedScript = {
  name: string;
  content: string;
  remote_path: string;
  priority: number;
  shell?: string;
  timeout?: number;
};

// Layer type for organizing nodes
export type LayerType = "IT" | "DMZ" | "OT";

// Node in a scenario definition
export type ScenarioNode = {
  name: string;
  template_key?: string;
  template_id?: string;
  template_name?: string;
  x: number;
  y: number;
  layer?: LayerType;
  scripts: EmbeddedScript[];
  children?: ScenarioNode[]; // Recursive child nodes
};

// Link between nodes using names
export type ScenarioLink = {
  nodes: {
    name: string;
    adapter_number: number;
    port_number: number;
  }[];
};

// Template mapping (key -> template_id)
export type TemplateMap = Record<string, string>;

// Complete scenario definition
export type ScenarioDefinition = {
  gns3_server_ip?: string;
  project_name: string;
  project_id?: string;
  templates: TemplateMap;
  nodes: ScenarioNode[];
  links: ScenarioLink[];
};

// Scenario metadata (list view)
export type ScenarioListItem = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

// Full scenario (detail view)
export type Scenario = {
  id: string;
  name: string;
  description?: string;
  definition: ScenarioDefinition;
  created_at: string;
  updated_at: string;
};

// Create scenario request
export type CreateScenarioRequest = {
  name: string;
  description?: string;
  definition: ScenarioDefinition;
};

// Update scenario request
export type UpdateScenarioRequest = {
  name?: string;
  description?: string;
  definition?: ScenarioDefinition;
};

// Deploy scenario request
export type DeployScenarioRequest = {
  gns3_server_ip: string;
  gns3_server_port?: number;
  username?: string;
  password?: string;
  project_name?: string;
  start_nodes?: boolean;
  run_scripts?: boolean;
  priority_delay?: number;
};

// Script execution result
export type ScriptExecutionResult = {
  node_name: string;
  script_name: string;
  priority: number;
  remote_path: string;
  success: boolean;
  error: string | null;
};

// Deploy scenario response
export type DeployScenarioResponse = {
  scenario_id: string;
  scenario_name: string;
  project_id: string;
  project_name: string;
  gns3_server_ip: string;
  nodes_created: number;
  links_created: number;
  scripts_executed: ScriptExecutionResult[];
  success: boolean;
  errors: string[];
};

// Push script request (for standalone scripts)
export type PushScriptRequest = {
  node_name: string;
  script_id: string;
  remote_path: string;
  run_after_upload?: boolean;
};

// Run script request
export type RunScriptRequest = {
  node_name: string;
  remote_path: string;
  timeout?: number;
};

// ============================================
// LEGACY TYPES (kept for compatibility)
// ============================================

// Script assignment for a device type (maps device types to scripts)
export type ScriptAssignment = {
  deviceType: string;
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

