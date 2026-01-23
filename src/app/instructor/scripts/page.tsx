"use client";

import ScriptLibrary from "../../components/ScriptLibrary";

export default function InstructorScriptsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Script Library</h1>
        <p className="text-[var(--muted)]">
          Manage reusable scripts for standalone pushing
        </p>
      </div>

      {/* Script Library Component */}
      <ScriptLibrary />
    </div>
  );
}
