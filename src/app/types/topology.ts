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
// TOPOLOGY-CENTRIC TYPES (Network Infrastructure)
// ============================================

// Embedded script in a topology node
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

// Node in a topology definition
export type TopologyNode = {
  name: string;
  template_key?: string;
  template_id?: string;
  template_name?: string;
  x: number;
  y: number;
  layer?: LayerType;
  quantity?: number; // Number of instances to create (expands to name-1, name-2, etc.)
  parent_name?: string; // Parent node name for hierarchy (set when flattening)
  scripts: EmbeddedScript[];
  children?: TopologyNode[]; // Recursive child nodes (used in form, flattened for API)
};

// Legacy alias for backwards compatibility
export type ScenarioNode = TopologyNode;

// Link between nodes using names
export type TopologyLink = {
  nodes: {
    name: string;
    adapter_number: number;
    port_number: number;
  }[];
};

// Legacy alias for backwards compatibility
export type ScenarioLink = TopologyLink;

// Template mapping (key -> template_id)
export type TemplateMap = Record<string, string>;

// Complete topology definition
export type TopologyDefinition = {
  gns3_server_ip?: string;
  project_name: string;
  project_id?: string;
  templates: TemplateMap;
  nodes: TopologyNode[];
  links: TopologyLink[];
};

// Legacy alias for backwards compatibility
export type ScenarioDefinition = TopologyDefinition;

// Topology metadata (list view)
export type TopologyListItem = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

// Legacy alias for backwards compatibility
export type ScenarioListItem = TopologyListItem;

// Full topology (detail view)
export type Topology = {
  id: string;
  name: string;
  description?: string;
  definition: TopologyDefinition;
  created_at: string;
  updated_at: string;
};

// Legacy alias for backwards compatibility
export type Scenario = Topology;

// Create topology request
export type CreateTopologyRequest = {
  name: string;
  description?: string;
  definition: TopologyDefinition;
};

// Legacy alias for backwards compatibility
export type CreateScenarioRequest = CreateTopologyRequest;

// Update topology request
export type UpdateTopologyRequest = {
  name?: string;
  description?: string;
  definition?: TopologyDefinition;
};

// Legacy alias for backwards compatibility
export type UpdateScenarioRequest = UpdateTopologyRequest;

// Deploy topology request
export type DeployTopologyRequest = {
  gns3_server_ip: string;
  gns3_server_port?: number;
  username?: string;
  password?: string;
  project_name?: string;
  start_nodes?: boolean;
  run_scripts?: boolean;
  priority_delay?: number;
};

// Legacy alias for backwards compatibility
export type DeployScenarioRequest = DeployTopologyRequest;

// Script execution result
export type ScriptExecutionResult = {
  node_name: string;
  script_name: string;
  priority: number;
  remote_path: string;
  success: boolean;
  error: string | null;
};

// Deploy topology response
export type DeployTopologyResponse = {
  topology_id: string;
  topology_name: string;
  project_id: string;
  project_name: string;
  gns3_server_ip: string;
  nodes_created: number;
  links_created: number;
  scripts_executed: ScriptExecutionResult[];
  success: boolean;
  errors: string[];
};

// Legacy alias for backwards compatibility
export type DeployScenarioResponse = DeployTopologyResponse;

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

// ============================================
// LOGGING & STUDENT MANAGEMENT TYPES
// ============================================

// Syslog collector node info
export type SnitchNodeInfo = {
  node_id: string;
  name: string;
  ip_address: string;
  port: number;
  connected_to_switch: string;
  console_port: number;
  console_host: string;
};

// Logging setup request
export type LoggingSetupRequest = {
  project_name: string;
  gns3_server_ip: string;
  gns3_server_port?: number;
  username?: string;
  password?: string;
  it_switch_name?: string;
  ot_switch_name?: string;
  syslog_template_name?: string;
};

// Logging setup response
export type LoggingSetupResponse = {
  student_name: string;
  display_name: string;
  project_name: string;
  snitch_nodes: SnitchNodeInfo[];
  injected_node_count: number;
  injected_nodes: string[];
  skipped_nodes: string[];
  errors: string[];
  message: string;
  reused_existing: boolean;
};

// Logging status response
export type LoggingStatusResponse = {
  student_name: string;
  display_name: string;
  is_active: boolean;
  project_name: string | null;
  snitch_nodes: SnitchNodeInfo[];
  injected_nodes: string[];
  created_at: string | null;
};

// Log preview response
export type LogPreviewResponse = {
  student_name: string;
  it_logs: string | null;
  ot_logs: string | null;
  errors: string[];
  retrieved_at: string;
};

// Log submission response
export type LogSubmissionResponse = {
  submission_id: string;
  student_name: string;
  submitted_at: string;
  project_name: string;
  it_log_lines: number;
  ot_log_lines: number;
  errors: string[];
  message: string;
};

// Teardown response
export type LoggingTeardownResponse = {
  student_name: string;
  removed_nodes: string[];
  message: string;
};

// Student info for instructor view
export type StudentInfo = {
  name: string;
  display_name: string;
  created_at: string;
  project_name: string;
  has_active_session: boolean;
  submission_count: number;
};

// Submission summary (without full logs)
export type SubmissionSummary = {
  id: string;
  student_name: string;
  display_name: string;
  submitted_at: string;
  project_name: string;
  it_log_lines: number;
  ot_log_lines: number;
};

// Full submission with logs
export type SubmissionDetail = SubmissionSummary & {
  it_logs: string;
  ot_logs: string;
  ai_analysis?: string | null;
  analyzed_at?: string | null;
  model_used?: string | null;
};

// AI Analysis response
export type AIAnalysisResponse = {
  student_name: string;
  submission_id?: string;
  ai_analysis: string;
  analyzed_at: string;
  model_used: string;
  summary?: string;
};

// Students list response
export type StudentsListResponse = {
  students: StudentInfo[];
  total_count: number;
};

// Submissions list response
export type SubmissionsListResponse = {
  submissions: SubmissionSummary[];
  total_count: number;
};

// Delete/reset response
export type DeleteResponse = {
  deleted_count: number;
  message: string;
};

