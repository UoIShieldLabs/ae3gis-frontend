"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Loader2, Server, Shield, Factory } from "lucide-react";
import {
  ScenarioNode,
  ScenarioDefinition,
  ScenarioLink,
  LayerType,
  CreateScenarioRequest,
  Scenario,
} from "../types/topology";
import NodeForm from "./NodeForm";
import { useTemplates } from "../hooks/useTemplates";
import { useSettings } from "../contexts/SettingsContext";
import {
  calculateAllPositions,
  flattenNodes,
  generateSwitchNodes,
  expandNodesByQuantity,
} from "../utils/positionCalculator";

interface ScenarioFormProps {
  initialScenario?: Scenario;
  onSave: (data: CreateScenarioRequest) => Promise<Scenario | null>;
  onCancel?: () => void;
}

const LAYER_CONFIG: { type: LayerType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "IT", label: "IT Layer", icon: <Server className="w-4 h-4" />, color: "text-blue-500" },
  { type: "DMZ", label: "DMZ Layer", icon: <Shield className="w-4 h-4" />, color: "text-yellow-500" },
  { type: "OT", label: "OT Layer", icon: <Factory className="w-4 h-4" />, color: "text-green-500" },
];

const DEFAULT_NODE: ScenarioNode = {
  name: "",
  template_key: "",
  x: 0,
  y: 0,
  scripts: [],
  children: [],
};

export default function ScenarioForm({
  initialScenario,
  onSave,
  onCancel,
}: ScenarioFormProps) {
  // Get settings for default project name
  const { settings } = useSettings();

  // Form state - use settings default if no initial scenario
  const [name, setName] = useState(initialScenario?.name || "");
  const [description, setDescription] = useState(initialScenario?.description || "");
  const [projectName, setProjectName] = useState(
    initialScenario?.definition.project_name || settings.defaultProjectName || ""
  );

  // Nodes by layer
  const [itNodes, setItNodes] = useState<ScenarioNode[]>([]);
  const [dmzNodes, setDmzNodes] = useState<ScenarioNode[]>([]);
  const [otNodes, setOtNodes] = useState<ScenarioNode[]>([]);

  // Template mapping
  const [switchTemplateKey, setSwitchTemplateKey] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load templates
  const { templates, loading: templatesLoading } = useTemplates();

  // Sync project name from settings if not set and not editing
  useEffect(() => {
    if (!initialScenario && !projectName && settings.defaultProjectName) {
      setProjectName(settings.defaultProjectName);
    }
  }, [settings.defaultProjectName, initialScenario, projectName]);

  // Initialize from existing scenario
  useEffect(() => {
    if (initialScenario) {
      const def = initialScenario.definition;
      setName(initialScenario.name);
      setDescription(initialScenario.description || "");
      setProjectName(def.project_name);

      // Categorize nodes by layer or position
      // Filter out auto-generated switches (they'll be regenerated on save)
      const it: ScenarioNode[] = [];
      const dmz: ScenarioNode[] = [];
      const ot: ScenarioNode[] = [];

      def.nodes.forEach((node) => {
        // Skip auto-generated switches
        if (node.name === "IT-Switch" || node.name === "OT-Switch") {
          return;
        }
        
        // Use layer if set, otherwise infer from Y position
        // Note: IT has negative Y (top), OT has positive Y (bottom)
        if (node.layer === "IT" || (!node.layer && (node.y ?? 0) < -100)) {
          it.push({ ...node, layer: "IT" });
        } else if (node.layer === "OT" || (!node.layer && (node.y ?? 0) > 100)) {
          ot.push({ ...node, layer: "OT" });
        } else {
          dmz.push({ ...node, layer: "DMZ" });
        }
      });

      setItNodes(it);
      setDmzNodes(dmz);
      setOtNodes(ot);
    }
  }, [initialScenario]);

  // Node management for each layer
  const addNode = (layer: LayerType) => {
    const newNode = { ...DEFAULT_NODE, layer };
    if (layer === "IT") {
      setItNodes([...itNodes, newNode]);
    } else if (layer === "DMZ") {
      setDmzNodes([...dmzNodes, newNode]);
    } else {
      setOtNodes([...otNodes, newNode]);
    }
  };

  const updateNode = (layer: LayerType, index: number, node: ScenarioNode) => {
    if (layer === "IT") {
      const newNodes = [...itNodes];
      newNodes[index] = node;
      setItNodes(newNodes);
    } else if (layer === "DMZ") {
      const newNodes = [...dmzNodes];
      newNodes[index] = node;
      setDmzNodes(newNodes);
    } else {
      const newNodes = [...otNodes];
      newNodes[index] = node;
      setOtNodes(newNodes);
    }
  };

  const removeNode = (layer: LayerType, index: number) => {
    if (layer === "IT") {
      setItNodes(itNodes.filter((_, i) => i !== index));
    } else if (layer === "DMZ") {
      setDmzNodes(dmzNodes.filter((_, i) => i !== index));
    } else {
      setOtNodes(otNodes.filter((_, i) => i !== index));
    }
  };

  // Build template map from all nodes
  const buildTemplateMap = (allNodes: ScenarioNode[]): Record<string, string> => {
    const map: Record<string, string> = {};
    
    const processNode = (node: ScenarioNode) => {
      if (node.template_key) {
        const template = templates.find((t) => t.name === node.template_key);
        if (template) {
          map[node.template_key] = template.template_id;
        }
      }
      node.children?.forEach(processNode);
    };

    allNodes.forEach(processNode);
    return map;
  };

  // Generate links (connect nodes properly: children to parents, top-level to switches)
  const generateLinks = (
    allNodes: ScenarioNode[],
    switches: ScenarioNode[],
    dmzNodes: ScenarioNode[]
  ): ScenarioLink[] => {
    const links: ScenarioLink[] = [];
    // Track adapter usage per node (Open vSwitch uses adapters, not ports)
    const adapterCounters: Record<string, number> = {};

    const getNextAdapter = (nodeName: string) => {
      if (!adapterCounters[nodeName]) {
        adapterCounters[nodeName] = 0;
      }
      return adapterCounters[nodeName]++;
    };

    // Find IT and OT switches
    const itSwitch = switches.find((s) => s.name === "IT-Switch");
    const otSwitch = switches.find((s) => s.name === "OT-Switch");
    
    // Find firewalls (DMZ nodes that aren't switches)
    const firewalls = dmzNodes.filter((n) => 
      !n.name.includes("Switch") && n.layer === "DMZ"
    );

    // Separate nodes into: those with parents (children) and top-level nodes
    const childNodes = allNodes.filter((n) => n.parent_name);
    const topLevelIT = allNodes.filter((n) => n.layer === "IT" && !n.parent_name);
    const topLevelOT = allNodes.filter((n) => n.layer === "OT" && !n.parent_name);

    // Connect child nodes to their parent nodes
    childNodes.forEach((child) => {
      const parent = allNodes.find((n) => n.name === child.parent_name);
      if (parent) {
        links.push({
          nodes: [
            { name: child.name, adapter_number: 0, port_number: 0 },
            { name: parent.name, adapter_number: getNextAdapter(parent.name), port_number: 0 },
          ],
        });
      }
    });

    // Connect top-level IT nodes to IT-Switch
    if (itSwitch) {
      topLevelIT.forEach((node) => {
        links.push({
          nodes: [
            { name: node.name, adapter_number: getNextAdapter(node.name), port_number: 0 },
            { name: itSwitch.name, adapter_number: getNextAdapter(itSwitch.name), port_number: 0 },
          ],
        });
      });
    }

    // Connect top-level OT nodes to OT-Switch
    if (otSwitch) {
      topLevelOT.forEach((node) => {
        links.push({
          nodes: [
            { name: node.name, adapter_number: getNextAdapter(node.name), port_number: 0 },
            { name: otSwitch.name, adapter_number: getNextAdapter(otSwitch.name), port_number: 0 },
          ],
        });
      });
    }

    // Connect switches to firewalls (IT-Switch -> Firewall(s) -> OT-Switch)
    if (firewalls.length > 0) {
      firewalls.forEach((firewall) => {
        if (itSwitch) {
          links.push({
            nodes: [
              { name: itSwitch.name, adapter_number: getNextAdapter(itSwitch.name), port_number: 0 },
              { name: firewall.name, adapter_number: getNextAdapter(firewall.name), port_number: 0 },
            ],
          });
        }
        if (otSwitch) {
          links.push({
            nodes: [
              { name: firewall.name, adapter_number: getNextAdapter(firewall.name), port_number: 0 },
              { name: otSwitch.name, adapter_number: getNextAdapter(otSwitch.name), port_number: 0 },
            ],
          });
        }
      });
    } else {
      // No firewall - connect switches directly
      if (itSwitch && otSwitch) {
        links.push({
          nodes: [
            { name: itSwitch.name, adapter_number: getNextAdapter(itSwitch.name), port_number: 0 },
            { name: otSwitch.name, adapter_number: getNextAdapter(otSwitch.name), port_number: 0 },
          ],
        });
      }
    }

    return links;
  };

  // Save handler
  const handleSave = async () => {
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Scenario name is required");
      return;
    }
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    const totalNodes = itNodes.length + dmzNodes.length + otNodes.length;
    if (totalNodes === 0) {
      setError("At least one node is required");
      return;
    }

    setSaving(true);

    try {
      // Expand nodes with quantity > 1 into individual nodes
      const expandedIT = expandNodesByQuantity(itNodes);
      const expandedDMZ = expandNodesByQuantity(dmzNodes);
      const expandedOT = expandNodesByQuantity(otNodes);

      // Calculate positions
      const positioned = calculateAllPositions(expandedIT, expandedDMZ, expandedOT);

      // Generate switch nodes for DMZ
      const switches = generateSwitchNodes(
        positioned.itNodes,
        positioned.otNodes,
        switchTemplateKey || "switch"
      );

      // Combine all DMZ nodes with auto-generated switches
      const allDmzNodes = [...positioned.dmzNodes, ...switches];

      // Flatten all nodes
      const allNodes = [
        ...flattenNodes(positioned.itNodes),
        ...flattenNodes(allDmzNodes),
        ...flattenNodes(positioned.otNodes),
      ];

      // Build template map
      const tplMap = buildTemplateMap(allNodes);
      
      // Add switch template if needed
      if (switches.length > 0 && switchTemplateKey) {
        const switchTpl = templates.find((t) => t.name === switchTemplateKey);
        if (switchTpl) {
          tplMap[switchTemplateKey] = switchTpl.template_id;
        }
      }

      // Generate links (pass DMZ nodes for firewall connections)
      const links = generateLinks(allNodes, switches, positioned.dmzNodes);

      // Build definition
      const definition: ScenarioDefinition = {
        project_name: projectName,
        templates: tplMap,
        nodes: allNodes,
        links,
      };

      // Create request
      const request: CreateScenarioRequest = {
        name,
        description: description || undefined,
        definition,
      };

      const result = await onSave(request);
      if (!result) {
        setError("Failed to save scenario");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const getNodes = (layer: LayerType) => {
    switch (layer) {
      case "IT":
        return itNodes;
      case "DMZ":
        return dmzNodes;
      case "OT":
        return otNodes;
    }
  };

  return (
    <div className="space-y-6">
      {/* Scenario Metadata */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Scenario Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Scenario Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., DHCP Lab Exercise"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              GNS3 Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., dhcp-lab"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-[var(--muted)] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students will learn..."
              rows={2}
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Switch Template (for auto-generated switches)
            </label>
            <select
              value={switchTemplateKey}
              onChange={(e) => setSwitchTemplateKey(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              disabled={templatesLoading}
            >
              <option value="">Select switch template...</option>
              {templates.map((t) => (
                <option key={t.template_id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Layer Sections */}
      {LAYER_CONFIG.map(({ type, label, icon, color }) => (
        <div
          key={type}
          className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden"
        >
          {/* Layer Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--input-bg)]">
            <div className="flex items-center gap-2">
              <span className={color}>{icon}</span>
              <h3 className="font-semibold">{label}</h3>
              <span className="text-sm text-[var(--muted)]">
                ({getNodes(type).length} nodes)
              </span>
            </div>
            <button
              type="button"
              onClick={() => addNode(type)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </button>
          </div>

          {/* Layer Nodes */}
          <div className="p-4 space-y-3">
            {getNodes(type).length === 0 ? (
              <p className="text-sm text-[var(--muted)] italic text-center py-4">
                No nodes in this layer. Click &quot;Add Node&quot; to add devices.
              </p>
            ) : (
              getNodes(type).map((node, index) => (
                <NodeForm
                  key={index}
                  node={node}
                  index={index}
                  templates={templates}
                  onChange={(i, n) => updateNode(type, i, n)}
                  onRemove={(i) => removeNode(type, i)}
                />
              ))
            )}
          </div>
        </div>
      ))}

      {/* Error Message */}
      {error && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {initialScenario ? "Update Scenario" : "Save Scenario"}
        </button>
      </div>
    </div>
  );
}
