"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Network,
  Link2,
  FileCode2,
  Server,
} from "lucide-react";
import { Topology, TopologyDefinition, TopologyNode, EmbeddedScript } from "../types/topology";

interface TopologyDetailViewProps {
  topology: Topology;
  onDefinitionChange?: (definition: TopologyDefinition) => void;
  readOnly?: boolean;
}

export default function TopologyDetailView({
  topology,
  onDefinitionChange,
  readOnly = false,
}: TopologyDetailViewProps) {
  const [definition, setDefinition] = useState<TopologyDefinition>(topology.definition);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Sync definition when topology changes
  useEffect(() => {
    setDefinition(topology.definition);
  }, [topology]);

  const updateDefinition = (updates: Partial<TopologyDefinition>) => {
    const newDef = { ...definition, ...updates };
    setDefinition(newDef);
    onDefinitionChange?.(newDef);
  };

  const updateNode = (index: number, updates: Partial<TopologyNode>) => {
    const newNodes = [...definition.nodes];
    newNodes[index] = { ...newNodes[index], ...updates };
    updateDefinition({ nodes: newNodes });
  };

  const updateLink = (index: number, nodeIndex: 0 | 1, field: string, value: string | number) => {
    const newLinks = [...definition.links];
    const newNodes = [...newLinks[index].nodes];
    newNodes[nodeIndex] = { ...newNodes[nodeIndex], [field]: value };
    newLinks[index] = { ...newLinks[index], nodes: newNodes };
    updateDefinition({ links: newLinks });
  };

  const updateScript = (nodeIndex: number, scriptIndex: number, updates: Partial<EmbeddedScript>) => {
    const newNodes = [...definition.nodes];
    const newScripts = [...newNodes[nodeIndex].scripts];
    newScripts[scriptIndex] = { ...newScripts[scriptIndex], ...updates };
    newNodes[nodeIndex] = { ...newNodes[nodeIndex], scripts: newScripts };
    updateDefinition({ nodes: newNodes });
  };

  const toggleNodeExpanded = (index: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedNodes(newExpanded);
  };

  const getLayerColor = (layer?: string) => {
    switch (layer) {
      case "IT": return "text-blue-500 bg-blue-500/10";
      case "DMZ": return "text-yellow-500 bg-yellow-500/10";
      case "OT": return "text-green-500 bg-green-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  // Infer layer from Y position if not explicitly set
  // IT: negative Y (top), OT: positive Y (bottom), DMZ: around 0
  const inferLayerFromY = (y: number): string | undefined => {
    if (y < -100) return "IT";
    if (y > 100) return "OT";
    if (y >= -100 && y <= 100) return "DMZ";
    return undefined;
  };

  return (
    <div className="space-y-6">
      {/* Project Configuration */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-[var(--input-bg)] border-b border-[var(--border)]">
          <h3 className="font-semibold flex items-center gap-2">
            <Server className="w-4 h-4" />
            Project Configuration
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Project Name</label>
              <input
                type="text"
                value={definition.project_name}
                onChange={(e) => updateDefinition({ project_name: e.target.value })}
                disabled={readOnly}
                className="w-full px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Templates Defined</label>
              <div className="px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg">
                {Object.keys(definition.templates).length} template(s)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-[var(--input-bg)] border-b border-[var(--border)]">
          <h3 className="font-semibold">Templates ({Object.keys(definition.templates).length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Key</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Template ID</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(definition.templates).map(([key, id]) => (
                <tr key={key} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2 font-mono text-xs">{key}</td>
                  <td className="px-4 py-2 font-mono text-xs text-[var(--muted)]">{id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nodes Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-[var(--input-bg)] border-b border-[var(--border)]">
          <h3 className="font-semibold flex items-center gap-2">
            <Network className="w-4 h-4" />
            Nodes ({definition.nodes.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2 text-[var(--muted)] font-medium w-8"></th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Name</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Layer</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Template</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Position (X, Y)</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Scripts</th>
              </tr>
            </thead>
            <tbody>
              {definition.nodes.map((node, idx) => (
                <>
                  <tr key={`node-${idx}`} className="border-b border-[var(--border)]">
                    <td className="px-4 py-2">
                      {node.scripts.length > 0 && (
                        <button
                          onClick={() => toggleNodeExpanded(idx)}
                          className="p-1 hover:bg-[var(--input-bg)] rounded"
                        >
                          {expandedNodes.has(idx) ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={node.name}
                        onChange={(e) => updateNode(idx, { name: e.target.value })}
                        disabled={readOnly}
                        className="w-full px-2 py-1 text-sm bg-transparent border border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] rounded focus:outline-none disabled:hover:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLayerColor(node.layer || inferLayerFromY(node.y))}`}>
                        {node.layer || inferLayerFromY(node.y) || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-[var(--muted)]">
                      {node.template_key || node.template_id || "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={node.x}
                          onChange={(e) => updateNode(idx, { x: parseInt(e.target.value) || 0 })}
                          disabled={readOnly}
                          className="w-16 px-2 py-1 text-sm text-center bg-transparent border border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] rounded focus:outline-none disabled:hover:border-transparent"
                        />
                        <span className="text-[var(--muted)]">,</span>
                        <input
                          type="number"
                          value={node.y}
                          onChange={(e) => updateNode(idx, { y: parseInt(e.target.value) || 0 })}
                          disabled={readOnly}
                          className="w-16 px-2 py-1 text-sm text-center bg-transparent border border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] rounded focus:outline-none disabled:hover:border-transparent"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {node.scripts.length > 0 ? (
                        <span className="flex items-center gap-1 text-[var(--accent)]">
                          <FileCode2 className="w-3 h-3" />
                          {node.scripts.length}
                        </span>
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                  {/* Expanded scripts */}
                  {expandedNodes.has(idx) && node.scripts.length > 0 && (
                    <tr key={`node-${idx}-scripts`} className="border-b border-[var(--border)] bg-[var(--input-bg)]/50">
                      <td colSpan={6} className="px-8 py-3">
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-[var(--muted)]">Scripts for {node.name}</h4>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-[var(--muted)]">
                                <th className="py-1 pr-4">Priority</th>
                                <th className="py-1 pr-4">Name</th>
                                <th className="py-1 pr-4">Remote Path</th>
                                <th className="py-1">Content Preview</th>
                              </tr>
                            </thead>
                            <tbody>
                              {node.scripts.map((script, sIdx) => (
                                <tr key={sIdx}>
                                  <td className="py-1 pr-4">
                                    <input
                                      type="number"
                                      value={script.priority}
                                      onChange={(e) => updateScript(idx, sIdx, { priority: parseInt(e.target.value) || 0 })}
                                      disabled={readOnly}
                                      className="w-12 px-1 py-0.5 text-center bg-[var(--card-bg)] border border-[var(--border)] rounded"
                                    />
                                  </td>
                                  <td className="py-1 pr-4 font-medium">{script.name}</td>
                                  <td className="py-1 pr-4 font-mono text-[var(--muted)]">{script.remote_path}</td>
                                  <td className="py-1 font-mono text-[var(--muted)] truncate max-w-xs">
                                    {script.content.substring(0, 50)}...
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-[var(--input-bg)] border-b border-[var(--border)]">
          <h3 className="font-semibold flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Links ({definition.links.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2 text-[var(--muted)] font-medium">#</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Node A</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Adapter/Port</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium text-center">↔</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Node B</th>
                <th className="px-4 py-2 text-[var(--muted)] font-medium">Adapter/Port</th>
              </tr>
            </thead>
            <tbody>
              {definition.links.map((link, idx) => (
                <tr key={idx} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2 text-[var(--muted)]">{idx + 1}</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={link.nodes[0]?.name || ""}
                      onChange={(e) => updateLink(idx, 0, "name", e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 text-sm bg-transparent border border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] rounded focus:outline-none disabled:hover:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1 text-xs">
                      <input
                        type="number"
                        value={link.nodes[0]?.adapter_number ?? 0}
                        onChange={(e) => updateLink(idx, 0, "adapter_number", parseInt(e.target.value) || 0)}
                        disabled={readOnly}
                        className="w-10 px-1 py-0.5 text-center bg-[var(--input-bg)] border border-[var(--border)] rounded"
                      />
                      <span>/</span>
                      <input
                        type="number"
                        value={link.nodes[0]?.port_number ?? 0}
                        onChange={(e) => updateLink(idx, 0, "port_number", parseInt(e.target.value) || 0)}
                        disabled={readOnly}
                        className="w-10 px-1 py-0.5 text-center bg-[var(--input-bg)] border border-[var(--border)] rounded"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center text-[var(--muted)]">—</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={link.nodes[1]?.name || ""}
                      onChange={(e) => updateLink(idx, 1, "name", e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 text-sm bg-transparent border border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] rounded focus:outline-none disabled:hover:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1 text-xs">
                      <input
                        type="number"
                        value={link.nodes[1]?.adapter_number ?? 0}
                        onChange={(e) => updateLink(idx, 1, "adapter_number", parseInt(e.target.value) || 0)}
                        disabled={readOnly}
                        className="w-10 px-1 py-0.5 text-center bg-[var(--input-bg)] border border-[var(--border)] rounded"
                      />
                      <span>/</span>
                      <input
                        type="number"
                        value={link.nodes[1]?.port_number ?? 0}
                        onChange={(e) => updateLink(idx, 1, "port_number", parseInt(e.target.value) || 0)}
                        disabled={readOnly}
                        className="w-10 px-1 py-0.5 text-center bg-[var(--input-bg)] border border-[var(--border)] rounded"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {definition.links.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                    No links defined
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
