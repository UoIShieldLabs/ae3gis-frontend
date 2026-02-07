"use client";

import { useState, useCallback } from "react";
import {
  ArrowLeft,
  Eye,
  Edit,
  FileCode,
  Upload,
  Play,
  Check,
  X,
  Loader2,
  Server,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Scenario,
  ScriptStep as ScriptStepType,
  MarkdownStep,
  ExecuteScriptRequest,
  ExecuteScriptResponse,
} from "../types/scenario";

// Upload status for each script step
type UploadStatus = "idle" | "uploading" | "success" | "error";

interface ScenarioViewProps {
  scenario: Scenario;
  onBack: () => void;
  onEdit?: () => void;
  onView?: () => void; // For instructor to switch to view mode from edit
  showEditButton?: boolean; // Show edit button (default true)
  showViewButton?: boolean; // Show view button (for instructor in edit mode)
  onExecuteScript: (request: ExecuteScriptRequest) => Promise<ExecuteScriptResponse | null>;
}

export default function ScenarioView({
  scenario,
  onBack,
  onEdit,
  onView,
  showEditButton = true,
  showViewButton = false,
  onExecuteScript,
}: ScenarioViewProps) {
  // Track upload status for each script step (by index)
  const [uploadStatus, setUploadStatus] = useState<Map<number, UploadStatus>>(new Map());

  const handleUpload = useCallback(async (stepIndex: number, runAfterUpload: boolean) => {
    const step = scenario.steps[stepIndex];
    if (step.type !== "script") return;

    const scriptStep = step as ScriptStepType;
    if (!scriptStep.target_nodes?.length) return;

    setUploadStatus((prev) => new Map(prev).set(stepIndex, "uploading"));

    try {
      const request: Partial<ExecuteScriptRequest> = {
        target_nodes: scriptStep.target_nodes,
        script_content: scriptStep.script_content,
        storage_path: scriptStep.storage_path || "/tmp/script.sh",
        shell: "sh",
        timeout: scriptStep.timeout || 5,
        run_after_upload: runAfterUpload,
      };

      const result = await onExecuteScript(request as ExecuteScriptRequest);
      
      if (result && result.failed_nodes === 0) {
        setUploadStatus((prev) => new Map(prev).set(stepIndex, "success"));
      } else {
        setUploadStatus((prev) => new Map(prev).set(stepIndex, "error"));
      }
    } catch {
      setUploadStatus((prev) => new Map(prev).set(stepIndex, "error"));
    }
  }, [scenario.steps, onExecuteScript]);

  const getStatusForStep = (index: number): UploadStatus => {
    return uploadStatus.get(index) || "idle";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          {showViewButton && onView && (
            <button
              onClick={onView}
              className="flex items-center gap-2 px-4 py-2 text-[var(--muted)] border border-[var(--border)] rounded-lg hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
          )}
          {showEditButton && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-[var(--accent)] border border-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/10 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Scenario Title & Description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          {scenario.name}
        </h1>
        {scenario.description && (
          <p className="text-[var(--muted)] text-lg">{scenario.description}</p>
        )}
      </div>

      {/* Paper Container - White background for all content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-8">
          {scenario.steps.map((step, index) => (
            <div key={index}>
              {step.type === "markdown" ? (
                <MarkdownStepView step={step} />
              ) : (
                <ScriptStepView
                  step={step}
                  status={getStatusForStep(index)}
                  onUpload={(runAfter) => handleUpload(index, runAfter)}
                />
              )}
            </div>
          ))}

          {/* Empty state */}
          {scenario.steps.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              This scenario has no steps yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Markdown Step - Rendered inline with paper-friendly styling
function MarkdownStepView({ step }: { step: MarkdownStep }) {
  return (
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-3">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700">{children}</li>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 text-emerald-700 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto text-gray-800">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-3 text-gray-800">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-600 my-3">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-emerald-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-200 rounded">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-left font-medium text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-gray-200 text-gray-700">
              {children}
            </td>
          ),
        }}
      >
        {step.content}
      </ReactMarkdown>
    </div>
  );
}

// Script Step - Simple row layout
interface ScriptStepViewProps {
  step: ScriptStepType;
  status: UploadStatus;
  onUpload: (runAfterUpload: boolean) => void;
}

function ScriptStepView({ step, status, onUpload }: ScriptStepViewProps) {
  const hasTargets = step.target_nodes && step.target_nodes.length > 0;
  const isUploading = status === "uploading";
  
  // Use run_after_upload field, default to true if not specified
  const shouldRunAfterUpload = step.run_after_upload !== false;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Script Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex-shrink-0">
            <FileCode className="w-5 h-5" />
          </div>

          {/* Script Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">
                {step.script_name || "Untitled Script"}
              </span>
              <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                {step.storage_path || "/tmp/script.sh"}
              </span>
            </div>
            
            {step.description && (
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
                {step.description}
              </p>
            )}

            {/* Target Nodes */}
            {hasTargets && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Server className="w-3.5 h-3.5 text-gray-400" />
                {step.target_nodes!.map((node) => (
                  <span
                    key={node}
                    className="text-xs bg-white border border-gray-300 text-gray-600 px-2 py-0.5 rounded"
                  >
                    {node}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Status & Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Status Indicator */}
          {status === "success" && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600">
              <Check className="w-5 h-5" />
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
              <X className="w-5 h-5" />
            </div>
          )}

          {/* Action Button - Only one button based on run_after_upload */}
          {hasTargets && (
            <button
              onClick={() => onUpload(shouldRunAfterUpload)}
              disabled={isUploading}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                shouldRunAfterUpload
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : shouldRunAfterUpload ? (
                <Play className="w-4 h-4" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{shouldRunAfterUpload ? "Upload & Run" : "Upload"}</span>
            </button>
          )}

          {!hasTargets && (
            <span className="text-sm text-gray-400">No targets</span>
          )}
        </div>
      </div>
    </div>
  );
}
