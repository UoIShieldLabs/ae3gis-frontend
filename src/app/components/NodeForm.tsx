"use client";

import { useState } from "react";
import {
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileCode2,
  GitBranch,
} from "lucide-react";
import { ScenarioNode, EmbeddedScript, Template } from "../types/topology";
import ScriptForm from "./ScriptForm";

interface NodeFormProps {
  node: ScenarioNode;
  index: number;
  templates: Template[];
  depth?: number;
  onChange: (index: number, node: ScenarioNode) => void;
  onRemove: (index: number) => void;
}

const DEFAULT_SCRIPT: EmbeddedScript = {
  name: "",
  content: "",
  remote_path: "/tmp/script.sh",
  priority: 10,
  shell: "sh",
  timeout: 30,
};

export default function NodeForm({
  node,
  index,
  templates,
  depth = 0,
  onChange,
  onRemove,
}: NodeFormProps) {
  const [expanded, setExpanded] = useState(true);
  const [showScripts, setShowScripts] = useState(false);
  const [showChildren, setShowChildren] = useState(false);

  const updateField = <K extends keyof ScenarioNode>(
    field: K,
    value: ScenarioNode[K]
  ) => {
    onChange(index, { ...node, [field]: value });
  };

  // Script management
  const addScript = () => {
    const newScripts = [...node.scripts, { ...DEFAULT_SCRIPT }];
    updateField("scripts", newScripts);
    setShowScripts(true);
  };

  const updateScript = (scriptIndex: number, script: EmbeddedScript) => {
    const newScripts = [...node.scripts];
    newScripts[scriptIndex] = script;
    updateField("scripts", newScripts);
  };

  const removeScript = (scriptIndex: number) => {
    const newScripts = node.scripts.filter((_, i) => i !== scriptIndex);
    updateField("scripts", newScripts);
  };

  // Child node management
  const addChildNode = () => {
    const newChild: ScenarioNode = {
      name: "",
      template_key: "",
      x: 0,
      y: 0,
      scripts: [],
      children: [],
    };
    const newChildren = [...(node.children || []), newChild];
    updateField("children", newChildren);
    setShowChildren(true);
  };

  const updateChildNode = (childIndex: number, childNode: ScenarioNode) => {
    const newChildren = [...(node.children || [])];
    newChildren[childIndex] = childNode;
    updateField("children", newChildren);
  };

  const removeChildNode = (childIndex: number) => {
    const newChildren = (node.children || []).filter((_, i) => i !== childIndex);
    updateField("children", newChildren);
  };

  // Indentation based on depth
  const indentClass = depth > 0 ? "ml-6 border-l-2 border-[var(--accent)]/30 pl-4" : "";

  return (
    <div className={`${indentClass}`}>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
        {/* Node Header */}
        <div
          className="flex items-center justify-between p-3 bg-[var(--input-bg)] cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
            )}
            <span className="font-medium">
              {node.name || `Node ${index + 1}`}
            </span>
            {node.scripts.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
                <FileCode2 className="w-3 h-3" />
                {node.scripts.length}
              </span>
            )}
            {(node.children?.length || 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                <GitBranch className="w-3 h-3" />
                {node.children?.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="p-1 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Node Content */}
        {expanded && (
          <div className="p-4 space-y-4">
            {/* Name and Template */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  value={node.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., DHCP-Server"
                  className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">
                  Template
                </label>
                <select
                  value={node.template_key || ""}
                  onChange={(e) => updateField("template_key", e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="">Select template...</option>
                  {templates.map((t) => (
                    <option key={t.template_id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scripts Section */}
            <div className="border-t border-[var(--border)] pt-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setShowScripts(!showScripts)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {showScripts ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <FileCode2 className="w-4 h-4 text-[var(--accent)]" />
                  Scripts ({node.scripts.length})
                </button>
                <button
                  type="button"
                  onClick={addScript}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Script
                </button>
              </div>

              {showScripts && node.scripts.length > 0 && (
                <div className="space-y-2">
                  {node.scripts.map((script, scriptIndex) => (
                    <ScriptForm
                      key={scriptIndex}
                      script={script}
                      index={scriptIndex}
                      onChange={updateScript}
                      onRemove={removeScript}
                    />
                  ))}
                </div>
              )}

              {showScripts && node.scripts.length === 0 && (
                <p className="text-sm text-[var(--muted)] italic">
                  No scripts added. Click &quot;Add Script&quot; to attach startup scripts.
                </p>
              )}
            </div>

            {/* Child Nodes Section (recursive) */}
            {depth < 2 && ( // Limit recursion depth
              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setShowChildren(!showChildren)}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    {showChildren ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    <GitBranch className="w-4 h-4 text-[var(--success)]" />
                    Child Nodes ({node.children?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={addChildNode}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--success)] text-white rounded hover:opacity-80 transition-opacity"
                  >
                    <Plus className="w-3 h-3" />
                    Add Child
                  </button>
                </div>

                {showChildren && (node.children?.length || 0) > 0 && (
                  <div className="space-y-3">
                    {node.children?.map((child, childIndex) => (
                      <NodeForm
                        key={childIndex}
                        node={child}
                        index={childIndex}
                        templates={templates}
                        depth={depth + 1}
                        onChange={updateChildNode}
                        onRemove={removeChildNode}
                      />
                    ))}
                  </div>
                )}

                {showChildren && (node.children?.length || 0) === 0 && (
                  <p className="text-sm text-[var(--muted)] italic">
                    No child nodes. Click &quot;Add Child&quot; to create nested nodes.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
