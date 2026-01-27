"use client";

import { useState, useEffect } from "react";
import { Save, User, Loader2, CheckCircle } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import SettingsForm from "../../components/SettingsForm";

export default function StudentSettingsPage() {
  const { settings, updateSettings, getSanitizedStudentName } = useSettings();
  const [studentName, setStudentName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialize from settings
  useEffect(() => {
    if (settings.studentName) {
      setStudentName(settings.studentName);
    }
  }, [settings.studentName]);

  const handleSaveName = () => {
    setSaving(true);
    updateSettings({ studentName: studentName.trim() });
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 300);
  };

  const sanitizedName = studentName.toLowerCase().trim().replace(/\s+/g, "_");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--muted)] mt-1">
          Configure your identity and GNS3 server connection
        </p>
      </div>

      {/* Student Name Section */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-semibold">Student Identity</h3>
        </div>
        <p className="text-sm text-[var(--muted)] mb-4">
          Enter your name to identify your telemetry recordings and submissions.
        </p>
        <div className="flex gap-4 items-end">
          <div className="flex-grow">
            <label className="block text-sm text-[var(--muted)] mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            {studentName.trim() && (
              <p className="text-xs text-[var(--muted)] mt-1">
                ID: <span className="font-mono">{sanitizedName}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleSaveName}
            disabled={saving || !studentName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      <SettingsForm showResetProject={false} />
    </div>
  );
}

