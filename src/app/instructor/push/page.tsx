"use client";

import ScriptPushForm from "../../components/ScriptPushForm";

export default function InstructorPushPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Push Scripts</h1>
        <p className="text-[var(--muted)]">
          Push scripts from the library to running GNS3 nodes
        </p>
      </div>

      <div className="max-w-3xl">
        <ScriptPushForm />
      </div>
    </div>
  );
}
