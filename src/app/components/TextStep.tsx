"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  Eye,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownStep } from "../types/scenario";

interface TextStepProps {
  step: MarkdownStep;
  index: number;
  onChange: (step: MarkdownStep) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

export default function TextStep({
  step,
  index,
  onChange,
  onRemove,
  readOnly = false,
}: TextStepProps) {
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(!step.content || step.content.trim() === "");

  const updateField = <K extends keyof MarkdownStep>(
    field: K,
    value: MarkdownStep[K]
  ) => {
    onChange({ ...step, [field]: value });
  };

  // Get preview text for collapsed view
  const getPreviewText = () => {
    if (step.title) return step.title;
    const firstLine = step.content.split("\n").find((line) => line.trim());
    if (firstLine) {
      return firstLine.replace(/^#+\s*/, "").slice(0, 60) + (firstLine.length > 60 ? "..." : "");
    }
    return "Instructions";
  };

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-[var(--input-bg)] cursor-pointer hover:bg-[var(--border)]/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-center w-7 h-7 rounded bg-blue-500/15 text-blue-500">
          <FileText className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--foreground)] truncate">
              {getPreviewText()}
            </span>
            <span className="text-xs text-[var(--muted)]">
              Step {index + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
                }}
                className={`p-1.5 rounded transition-colors ${
                  isEditing
                    ? "bg-[var(--accent)] text-white"
                    : "hover:bg-[var(--border)] text-[var(--muted)]"
                }`}
                title={isEditing ? "Preview" : "Edit"}
              >
                {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </button>
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
            </>
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
        <div className="p-4">
          {/* Title field (edit mode only) */}
          {!readOnly && isEditing && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                Title (optional)
              </label>
              <input
                type="text"
                value={step.title || ""}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Step title"
                className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              />
            </div>
          )}

          {/* Content */}
          {isEditing && !readOnly ? (
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                Content
              </label>
              <textarea
                value={step.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Write instructions here...

Use markdown formatting:
# Heading
**bold** and *italic*
- List items
`code`"
                className="w-full min-h-[150px] px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-y"
              />
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                Supports Markdown formatting
              </p>
            </div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-medium mb-2 mt-2">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 text-[var(--foreground)]">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-[var(--foreground)]">{children}</li>,
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 rounded bg-[var(--input-bg)] font-mono text-sm text-[var(--accent)]">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="p-3 rounded-md bg-[var(--input-bg)] font-mono text-sm overflow-x-auto mb-2">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[var(--accent)] pl-4 italic text-[var(--muted)] mb-2">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-4 border-[var(--border)]" />,
                  a: ({ href, children }) => (
                    <a href={href} className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {step.content || "*No content*"}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
