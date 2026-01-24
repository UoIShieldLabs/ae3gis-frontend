"use client";

import { useState } from "react";
import { FileCode2, Terminal } from "lucide-react";
import ScriptLibrary from "../../components/ScriptLibrary";
import ScriptPushForm from "../../components/ScriptPushForm";

type Tab = "library" | "push";

export default function InstructorScriptsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("library");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Scripts</h1>
        <p className="text-[var(--muted)]">
          Manage scripts and push them to running GNS3 nodes
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "library"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          Script Library
        </button>
        <button
          onClick={() => setActiveTab("push")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "push"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Terminal className="w-4 h-4" />
          Push Scripts
        </button>
      </div>

      {/* Content */}
      {activeTab === "library" ? (
        <ScriptLibrary />
      ) : (
        <div className="max-w-3xl">
          <ScriptPushForm />
        </div>
      )}
    </div>
  );
}
