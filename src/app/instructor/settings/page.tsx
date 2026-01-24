"use client";

import SettingsForm from "../../components/SettingsForm";

export default function InstructorSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--muted)] mt-1">
          Configure GNS3 server connection and default values
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
