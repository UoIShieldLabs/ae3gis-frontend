"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  ClipboardList,
  CheckCircle,
} from "lucide-react";
import { useStudentManagement } from "../../hooks/useStudentManagement";
import { SubmissionDetail } from "../../types/topology";

type ViewMode = "students" | "submissions";

export default function InstructorStudentsPage() {
  const {
    loading,
    error,
    students,
    submissions,
    fetchStudents,
    deleteStudent,
    fetchSubmissions,
    getSubmissionDetail,
    deleteSubmission,
    resetAll,
    clearError,
  } = useStudentManagement();

  const [viewMode, setViewMode] = useState<ViewMode>("students");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<SubmissionDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"it" | "ot">("it");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<"submissions" | "students" | "all" | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchSubmissions();
  }, [fetchStudents, fetchSubmissions]);

  const handleViewSubmissions = (studentName: string) => {
    setSelectedStudent(studentName);
    fetchSubmissions(studentName);
    setViewMode("submissions");
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setExpandedSubmissionId(null);
    setExpandedDetail(null);
    fetchSubmissions(); // Fetch all submissions
    setViewMode("students");
  };

  const handleToggleSubmission = async (submissionId: string, studentName: string) => {
    if (expandedSubmissionId === submissionId) {
      setExpandedSubmissionId(null);
      setExpandedDetail(null);
    } else {
      setExpandedSubmissionId(submissionId);
      const detail = await getSubmissionDetail(studentName, submissionId);
      if (detail) {
        setExpandedDetail(detail);
      }
    }
  };

  const handleDeleteStudent = async (studentName: string) => {
    clearError();
    setMessage(null);

    const confirmed = window.confirm(
      `Delete student "${studentName}" and their session? This will NOT delete their submissions.`
    );
    if (!confirmed) return;

    const result = await deleteStudent(studentName);
    if (result) {
      setMessage({ type: "success", text: result.message });
    }
  };

  const handleDeleteSubmission = async (studentName: string, submissionId: string) => {
    clearError();
    setMessage(null);

    const confirmed = window.confirm(`Delete submission ${submissionId}?`);
    if (!confirmed) return;

    const result = await deleteSubmission(studentName, submissionId);
    if (result) {
      setMessage({ type: "success", text: result.message });
      setExpandedSubmissionId(null);
      setExpandedDetail(null);
    }
  };

  const handleReset = async (target: "submissions" | "students" | "all") => {
    clearError();
    setMessage(null);
    setShowResetConfirm(null);

    const result = await resetAll(target);
    if (result) {
      setMessage({ type: "success", text: result.message });
    }
  };

  const getResetWarningText = (target: "submissions" | "students" | "all") => {
    switch (target) {
      case "submissions":
        return "This will permanently delete ALL student submissions. This cannot be undone.";
      case "students":
        return "This will delete ALL student sessions (but keep submissions). This cannot be undone.";
      case "all":
        return "This will delete ALL student sessions AND all submissions. This cannot be undone.";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {viewMode === "students" ? "Students" : `Submissions${selectedStudent ? ` - ${selectedStudent}` : ""}`}
          </h1>
          <p className="text-[var(--muted)] mt-1">
            {viewMode === "students"
              ? `${students.length} student${students.length !== 1 ? "s" : ""} registered`
              : `${submissions.length} submission${submissions.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {viewMode === "submissions" && selectedStudent && (
            <button
              onClick={handleBackToStudents}
              className="px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)]"
            >
              ← Back to Students
            </button>
          )}
          <button
            onClick={() => {
              fetchStudents();
              fetchSubmissions(selectedStudent || undefined);
            }}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Messages */}
      {(error || message) && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            error || message?.type === "error"
              ? "bg-red-500/10 border border-red-500/30"
              : "bg-green-500/10 border border-green-500/30"
          }`}
        >
          {error || message?.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          )}
          <p className={error || message?.type === "error" ? "text-red-500" : "text-green-500"}>
            {error || message?.text}
          </p>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-bold">Confirm Reset</h2>
            </div>
            <p className="text-[var(--muted)] mb-6">{getResetWarningText(showResetConfirm)}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(null)}
                className="px-4 py-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReset(showResetConfirm)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      {!selectedStudent && (
        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => setViewMode("students")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              viewMode === "students"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Users className="w-4 h-4" />
            Students
          </button>
          <button
            onClick={() => setViewMode("submissions")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              viewMode === "submissions"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            All Submissions
          </button>
        </div>
      )}

      {/* Students View */}
      {viewMode === "students" && (
        <>
          {loading && students.length === 0 ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--muted)]" />
              <p className="text-[var(--muted)]">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 text-center">
              <Users className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Students Yet</h2>
              <p className="text-[var(--muted)]">Students will appear here when they start recording telemetry.</p>
            </div>
          ) : (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[var(--input-bg)] border-b border-[var(--border)]">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted)]">Student</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted)]">Project</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted)]">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted)]">Submissions</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted)]">Created</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[var(--muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {students.map((student) => (
                    <tr key={student.name} className="hover:bg-[var(--input-bg)]">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{student.display_name}</div>
                          <div className="text-sm text-[var(--muted)]">{student.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{student.project_name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${
                            student.has_active_session
                              ? "bg-green-500/10 text-green-500"
                              : "bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              student.has_active_session ? "bg-green-500" : "bg-gray-500"
                            }`}
                          />
                          {student.has_active_session ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewSubmissions(student.name)}
                          className="text-sm text-[var(--accent)] hover:underline"
                        >
                          {student.submission_count} submission{student.submission_count !== 1 ? "s" : ""}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteStudent(student.name)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          title="Delete student session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reset Section */}
          {students.length > 0 && (
            <div className="bg-[var(--card-bg)] border border-red-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-500">Danger Zone</h3>
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">
                These actions are irreversible. Use with caution.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowResetConfirm("submissions")}
                  className="px-4 py-2 text-sm border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10"
                >
                  Reset All Submissions
                </button>
                <button
                  onClick={() => setShowResetConfirm("students")}
                  className="px-4 py-2 text-sm border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10"
                >
                  Reset All Students
                </button>
                <button
                  onClick={() => setShowResetConfirm("all")}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Submissions View */}
      {viewMode === "submissions" && (
        <>
          {loading && submissions.length === 0 ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--muted)]" />
              <p className="text-[var(--muted)]">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 text-center">
              <ClipboardList className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Submissions</h2>
              <p className="text-[var(--muted)]">
                {selectedStudent
                  ? `${selectedStudent} has no submissions yet.`
                  : "No student submissions yet."}
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
                  <div className="flex items-center justify-between p-4">
                    <button
                      onClick={() => handleToggleSubmission(submission.id, submission.student_name)}
                      className="flex items-center gap-4 flex-grow text-left"
                    >
                      <div>
                        <div className="font-medium">
                          {submission.display_name} - Submission {submission.id}
                        </div>
                        <div className="text-sm text-[var(--muted)] flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(submission.submitted_at).toLocaleString()}
                          <span>•</span>
                          <span>Project: {submission.project_name}</span>
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="text-[var(--muted)]">IT: {submission.it_log_lines} lines</div>
                        <div className="text-[var(--muted)]">OT: {submission.ot_log_lines} lines</div>
                      </div>
                      <button
                        onClick={() => handleDeleteSubmission(submission.student_name, submission.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        title="Delete submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleSubmission(submission.id, submission.student_name)}>
                        {expandedSubmissionId === submission.id ? (
                          <ChevronUp className="w-5 h-5 text-[var(--muted)]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[var(--muted)]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedSubmissionId === submission.id && (
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
        </>
      )}
    </div>
  );
}
