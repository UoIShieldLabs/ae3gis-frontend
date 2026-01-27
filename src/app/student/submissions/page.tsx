"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Settings,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { SubmissionSummary, SubmissionDetail } from "../../types/topology";
import { useRouter } from "next/navigation";

export default function StudentSubmissionsPage() {
  const router = useRouter();
  const { settings, getSanitizedStudentName } = useSettings();
  const studentName = getSanitizedStudentName();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<SubmissionDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"it" | "ot">("it");

  const fetchSubmissions = useCallback(async () => {
    if (!studentName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/instructor/submissions?student_name=${encodeURIComponent(studentName)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch submissions");
      }

      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [studentName]);

  const fetchSubmissionDetail = async (submissionId: string) => {
    if (!studentName) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/instructor/submissions/${encodeURIComponent(studentName)}/${encodeURIComponent(submissionId)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch submission detail");
      }

      setExpandedDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (submissionId: string) => {
    if (expandedId === submissionId) {
      setExpandedId(null);
      setExpandedDetail(null);
    } else {
      setExpandedId(submissionId);
      fetchSubmissionDetail(submissionId);
    }
  };

  useEffect(() => {
    if (studentName) {
      fetchSubmissions();
    }
  }, [studentName, fetchSubmissions]);

  // Show prompt if no student name
  if (!settings.studentName) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Submissions</h1>
          <p className="text-[var(--muted)] mt-1">View your submitted logs</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[var(--warning)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Student Name Required</h2>
          <p className="text-[var(--muted)] mb-6">
            Please enter your name in Settings to view your submissions.
          </p>
          <button
            onClick={() => router.push("/student/settings")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Settings className="w-4 h-4" />
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Submissions</h1>
          <p className="text-[var(--muted)] mt-1">
            View your submitted logs • Student: <span className="font-medium text-[var(--foreground)]">{settings.studentName}</span>
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {loading && submissions.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--muted)]" />
          <p className="text-[var(--muted)]">Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 text-center">
          <ClipboardList className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Submissions Yet</h2>
          <p className="text-[var(--muted)]">
            Start recording telemetry and submit your logs to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => handleToggleExpand(submission.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--input-bg)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="font-medium">Submission {submission.id}</div>
                    <div className="text-sm text-[var(--muted)] flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(submission.submitted_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="text-[var(--muted)]">IT: {submission.it_log_lines} lines</div>
                    <div className="text-[var(--muted)]">OT: {submission.ot_log_lines} lines</div>
                  </div>
                  {expandedId === submission.id ? (
                    <ChevronUp className="w-5 h-5 text-[var(--muted)]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[var(--muted)]" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === submission.id && (
                <div className="border-t border-[var(--border)]">
                  {/* Tabs */}
                  <div className="flex border-b border-[var(--border)]">
                    <button
                      onClick={() => setActiveTab("it")}
                      className={`flex-1 px-4 py-2 text-sm font-medium ${
                        activeTab === "it"
                          ? "bg-[var(--input-bg)] border-b-2 border-[var(--accent)] text-[var(--accent)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      IT Logs ({submission.it_log_lines} lines)
                    </button>
                    <button
                      onClick={() => setActiveTab("ot")}
                      className={`flex-1 px-4 py-2 text-sm font-medium ${
                        activeTab === "ot"
                          ? "bg-[var(--input-bg)] border-b-2 border-[var(--accent)] text-[var(--accent)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      OT Logs ({submission.ot_log_lines} lines)
                    </button>
                  </div>

                  {/* Log Content */}
                  <div className="p-4">
                    {loading && !expandedDetail ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
                      </div>
                    ) : expandedDetail ? (
                      <pre className="text-sm font-mono bg-[var(--input-bg)] p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                        {activeTab === "it"
                          ? expandedDetail.it_logs || "(No IT logs)"
                          : expandedDetail.ot_logs || "(No OT logs)"}
                      </pre>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
