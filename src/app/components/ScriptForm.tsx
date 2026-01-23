"use client";

import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { EmbeddedScript } from "../types/topology";

interface ScriptFormProps {
  script: EmbeddedScript;
  index: number;
  onChange: (index: number, script: EmbeddedScript) => void;
  onRemove: (index: number) => void;
}

export default function ScriptForm({
  script,
  index,
  onChange,
  onRemove,
}: ScriptFormProps) {
  const [expanded, setExpanded] = useState(true);

  const updateField = <K extends keyof EmbeddedScript>(
    field: K,
    value: EmbeddedScript[K]
  ) => {
    onChange(index, { ...script, [field]: value });
  };

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      {/* Header */}
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
          <span className="font-medium text-sm">
            {script.name || `Script ${index + 1}`}
          </span>
          <span className="text-xs text-[var(--muted)]">
            Priority: {script.priority}
          </span>
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

      {/* Content */}
      {expanded && (
        <div className="p-3 space-y-3">
          {/* Name and Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">
                Script Name
              </label>
              <input
                type="text"
                value={script.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Configure DHCP"
                className="w-full px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">
                Priority (lower = first)
              </label>
              <input
                type="number"
                value={script.priority}
                onChange={(e) =>
                  updateField("priority", parseInt(e.target.value) || 10)
                }
                min={1}
                className="w-full px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Remote Path and Shell */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">
                Remote Path
              </label>
              <input
                type="text"
                value={script.remote_path}
                onChange={(e) => updateField("remote_path", e.target.value)}
                placeholder="/tmp/script.sh"
                className="w-full px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">
                  Shell
                </label>
                <select
                  value={script.shell || "sh"}
                  onChange={(e) => updateField("shell", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="sh">sh</option>
                  <option value="bash">bash</option>
                  <option value="python">python</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">
                  Timeout (s)
                </label>
                <input
                  type="number"
                  value={script.timeout || 30}
                  onChange={(e) =>
                    updateField("timeout", parseFloat(e.target.value) || 30)
                  }
                  min={1}
                  className="w-full px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Script Content */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              Script Content
            </label>
            <textarea
              value={script.content}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="#!/bin/sh&#10;# Your script here..."
              rows={6}
              className="w-full px-3 py-2 text-sm font-mono bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}
