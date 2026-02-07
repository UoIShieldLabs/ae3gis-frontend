// ============================================
// SCENARIO TYPES
// ============================================

// Base step interface
interface BaseStep {
  title?: string;
}

// Markdown/text instruction step
export interface MarkdownStep extends BaseStep {
  type: "markdown";
  content: string;
}

// Script step
export interface ScriptStep extends BaseStep {
  type: "script";
  script_name: string;
  script_content: string;
  storage_path?: string; // default: "/tmp/script.sh"
  target_nodes?: string[]; // node names to upload/execute on
  run_after_upload?: boolean; // default: false (upload only)
  timeout?: number; // default: 5.0
  description?: string;
}

// Union type for all step types
export type ScenarioStep = MarkdownStep | ScriptStep;

// Scenario list item (from LIST endpoint)
export interface ScenarioListItem {
  id: string;
  name: string;
  description?: string;
  project_name?: string;
  default_topology_id?: string;
  step_count: number;
  script_count: number;
  markdown_count: number;
  created_at: string;
  updated_at: string;
}

// Full scenario (from GET endpoint)
export interface Scenario extends ScenarioListItem {
  steps: ScenarioStep[];
}

// Create scenario request
export interface CreateScenarioRequest {
  name: string;
  description?: string;
  project_name?: string;
  default_topology_id?: string;
  steps?: ScenarioStep[];
}

// Update scenario request
export interface UpdateScenarioRequest {
  name?: string;
  description?: string;
  project_name?: string;
  default_topology_id?: string;
  steps?: ScenarioStep[];
}

// Execute script request
export interface ExecuteScriptRequest {
  gns3_server_ip: string;
  gns3_server_port?: number;
  username?: string;
  password?: string;
  project_name: string;
  target_nodes: string[];
  script_content: string;
  storage_path?: string;
  shell?: string;
  timeout?: number;
  run_after_upload?: boolean; // default: true if omitted
}

// Per-node execution result
export interface ScriptExecutionNodeResult {
  node_name: string;
  success: boolean;
  output: string;
  error: string | null;
  exit_code: number;
}

// Execute script response
export interface ExecuteScriptResponse {
  project_name: string;
  script_storage_path: string;
  total_nodes: number;
  successful_nodes: number;
  failed_nodes: number;
  results: ScriptExecutionNodeResult[];
}

// ============================================
// EXECUTE SCRIPT TYPES (for /scenarios/execute endpoint)
// ============================================

// Note: The /scenarios/execute endpoint accepts inline script_content
// and runs it on target nodes. This is different from /scripts/push
// which requires a pre-created script_id.

// Execute script request (matches /scenarios/execute)
export interface ExecuteScriptRequest {
  gns3_server_ip: string;
  gns3_server_port?: number;
  username?: string;
  password?: string;
  project_name: string;
  target_nodes: string[];
  script_content: string;
  storage_path?: string; // default: "/tmp/script.sh"
  shell?: string; // default: "sh"
  timeout?: number; // default: 30.0
  run_after_upload?: boolean; // whether to execute after upload
}

// Execute script response
export interface ExecuteScriptResponse {
  project_name: string;
  script_storage_path: string;
  total_nodes: number;
  successful_nodes: number;
  failed_nodes: number;
  results: ScriptExecutionNodeResult[];
}

// Project node info (from List Project Nodes endpoint)
export interface ProjectNode {
  node_id: string;
  name: string;
  status: string;
  console: number;
  console_type: string;
  console_host: string;
  node_type: string;
  template_id: string;
  layer?: string;
  x: number;
  y: number;
}

// List project nodes response
export interface ListProjectNodesResponse {
  project_id: string;
  project_name: string;
  total_nodes: number;
  nodes: ProjectNode[];
  nodes_by_layer: {
    IT: ProjectNode[];
    DMZ: ProjectNode[];
    OT: ProjectNode[];
    Field: ProjectNode[];
    Unknown: ProjectNode[];
  };
}

// Default values for script steps
export const DEFAULT_SCRIPT_STEP: Omit<ScriptStep, "type"> = {
  script_name: "new-script",
  script_content: "",
  storage_path: "/tmp/script.sh",
  target_nodes: [],
  run_after_upload: false,
  timeout: 5,
  description: "",
};

// Default values for markdown steps
export const DEFAULT_MARKDOWN_STEP: Omit<MarkdownStep, "type"> = {
  title: "",
  content: "# Step Title\n\nWrite your instructions here...\n",
};
