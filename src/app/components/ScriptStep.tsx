"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Upload,
  FileCode,
} from "lucide-react";
import { ScriptStep as ScriptStepType, ProjectNode } from "../types/scenario";

interface ScriptStepProps {
  step: ScriptStepType;
  index: number;
  onChange: (step: ScriptStepType) => void;
  onRemove: () => void;
  onPush?: () => Promise<void>;
  availableNodes: ProjectNode[];
  readOnly?: boolean;
  isPushing?: boolean;
}

export default function ScriptStep({
  step,
  index,
  onChange,
  onRemove,
  onPush,
  availableNodes,
  readOnly = false,
  isPushing = false,
}: ScriptStepProps) {
  const [expanded, setExpanded] = useState(true);

  const updateField = <K extends keyof ScriptStepType>(
    field: K,
    value: ScriptStepType[K]
  ) => {
    onChange({ ...step, [field]: value });
  };

  const toggleNode = (nodeName: string) => {
    const currentNodes = step.target_nodes || [];
    const newNodes = currentNodes.includes(nodeName)
      ? currentNodes.filter((n) => n !== nodeName)
      : [...currentNodes, nodeName];
    updateField("target_nodes", newNodes);
  };

  const isNodeSelected = (nodeName: string) => {
    return step.target_nodes?.includes(nodeName) || false;
  };

  const canPush = step.target_nodes && step.target_nodes.length > 0 && !isPushing;

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-[var(--input-bg)] cursor-pointer hover:bg-[var(--border)]/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-center w-7 h-7 rounded bg-emerald-500/15 text-emerald-500">
          <FileCode className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--foreground)] truncate">
              {step.script_name || "Untitled Script"}
            </span>
            <span className="text-xs text-[var(--muted)]">
              Step {index + 1}
            </span>
          </div>
          {step.description && !expanded && (
            <p className="text-xs text-[var(--muted)] truncate mt-0.5">
              {step.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1.5 rounded hover:bg-[var(--danger)]/20 text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
              title="Remove step"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Script Name */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                Script Name
              </label>
              <input
                type="text"
                value={step.script_name}
                onChange={(e) => updateField("script_name", e.target.value)}
                disabled={readOnly}
                placeholder="my-script"
                className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-60"
              />
            </div>

            {/* Storage Path */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                File Path (on target node)
              </label>
              <input
                type="text"
                value={step.storage_path || "/tmp/script.sh"}
                onChange={(e) => updateField("storage_path", e.target.value)}
                disabled={readOnly}
                placeholder="/tmp/script.sh"
                className="w-full px-3 py-2 text-sm font-mono border border-[var(--border)] rounded-md bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-60"
              />
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                Timeout (seconds)
              </label>
              <input
                type="number"
                value={step.timeout || 5}
                onChange={(e) => updateField("timeout", Number(e.target.value))}
                disabled={readOnly}
                min={1}
                max={300}
                className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={step.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              disabled={readOnly}
              placeholder="What does this script do?"
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-60"
            />
          </div>

          {/* Script Content */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
              Content
            </label>
            <textarea
              value={step.script_content}
              onChange={(e) => updateField("script_content", e.target.value)}
              disabled={readOnly}
              placeholder="Enter your script or file content here..."
              className="w-full min-h-[150px] px-3 py-2 text-sm font-mono border border-[var(--border)] rounded-md bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-60 resize-y"
              spellCheck={false}
            />
          </div>

          {/* Target Nodes - List style */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
              Target Nodes
            </label>
            {availableNodes.length > 0 ? (
              <div className="border border-[var(--border)] rounded-md max-h-[200px] overflow-y-auto">
                {availableNodes.map((node) => (
                  <label
                    key={node.node_id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[var(--input-bg)] border-b border-[var(--border)] last:border-b-0 transition-colors ${
                      isNodeSelected(node.name) ? "bg-[var(--accent)]/5" : ""
                    } ${readOnly ? "cursor-default" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isNodeSelected(node.name)}
                      onChange={() => !readOnly && toggleNode(node.name)}
                      disabled={readOnly}
                      className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]/50"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{node.name}</span>
                      <span className="text-xs text-[var(--muted)] ml-2">
                        {node.node_type}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      node.status === "started" 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-[var(--muted)]/10 text-[var(--muted)]"
                    }`}>
                      {node.status}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-[var(--muted)] border border-[var(--border)] rounded-md bg-[var(--input-bg)]">
                No nodes available. Configure GNS3 settings and ensure your project has running nodes.
              </div>
            )}
            {step.target_nodes && step.target_nodes.length > 0 && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                {step.target_nodes.length} node{step.target_nodes.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Action Row */}
          {onPush && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={step.run_after_upload || false}
                  onChange={(e) => updateField("run_after_upload", e.target.checked)}
                  disabled={readOnly}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]/50"
                />
                <span className="text-sm text-[var(--foreground)]">
                  Run after upload
                </span>
              </label>

              <button
                onClick={onPush}
                disabled={!canPush}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  canPush
                    ? "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80"
                    : "bg-[var(--muted)]/20 text-[var(--muted)] cursor-not-allowed"
                }`}
              >
                <Upload className="w-4 h-4" />
                {isPushing ? "Uploading..." : step.run_after_upload ? "Upload & Run" : "Upload"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
