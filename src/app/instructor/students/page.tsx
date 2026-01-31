"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Users,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  ClipboardList,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useStudentManagement } from "../../hooks/useStudentManagement";
import { SubmissionDetail, AIAnalysisResponse } from "../../types/topology";

type ViewMode = "students" | "submissions";
type LogTab = "it" | "ot" | "ai";

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
    analyzeSubmission,
    clearError,
  } = useStudentManagement();

  const [viewMode, setViewMode] = useState<ViewMode>("students");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<SubmissionDetail | null>(null);
  const [activeTab, setActiveTab] = useState<LogTab>("it");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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
      setAiAnalysis(null);
      setAiError(null);
    } else {
      setExpandedSubmissionId(submissionId);
      setAiAnalysis(null);
      setAiError(null);
      setActiveTab("it");
      const detail = await getSubmissionDetail(studentName, submissionId);
      if (detail) {
        setExpandedDetail(detail);
        // If there's existing AI analysis, populate it
        if (detail.ai_analysis) {
          setAiAnalysis({
            student_name: studentName,
            submission_id: submissionId,
            ai_analysis: detail.ai_analysis,
            analyzed_at: detail.analyzed_at || "",
            model_used: detail.model_used || "unknown",
          });
        }
      }
    }
  };

  const handleAnalyzeSubmission = async (studentName: string, submissionId: string) => {
    setAiLoading(true);
    setAiError(null);
    
    const result = await analyzeSubmission(studentName, submissionId);
    
    setAiLoading(false);
    
    if (result) {
      setAiAnalysis(result);
      setActiveTab("ai");
    } else {
      setAiError(error || "Failed to analyze submission");
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
                        <button
                          onClick={() => setActiveTab("ai")}
                          className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
                            activeTab === "ai"
                              ? "bg-[var(--input-bg)] border-b-2 border-[var(--accent)] text-[var(--accent)]"
                              : "text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          AI Analysis
                          {aiAnalysis && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="p-4">
                        {activeTab === "ai" ? (
                          // AI Analysis Content
                          <div className="space-y-4">
                            {/* Analyze Button */}
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-[var(--muted)]">
                                {aiAnalysis ? (
                                  <span>
                                    Analyzed {new Date(aiAnalysis.analyzed_at).toLocaleString()} • Model: {aiAnalysis.model_used}
                                  </span>
                                ) : (
                                  "No analysis yet"
                                )}
                              </div>
                              <button
                                onClick={() => handleAnalyzeSubmission(submission.student_name, submission.id)}
                                disabled={aiLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                              >
                                {aiLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                                {aiAnalysis ? "Re-analyze" : "Analyze"}
                              </button>
                            </div>

                            {/* AI Error */}
                            {aiError && (
                              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-red-500 text-sm">{aiError}</p>
                              </div>
                            )}

                            {/* AI Loading State */}
                            {aiLoading && (
                              <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] mb-4" />
                                <p className="text-[var(--muted)]">Analyzing submission with AI...</p>
                                <p className="text-xs text-[var(--muted)] mt-1">This may take a moment</p>
                              </div>
                            )}

                            {/* AI Analysis Result */}
                            {aiAnalysis && !aiLoading && (
                              <div className="prose prose-sm max-w-none dark:prose-invert bg-[var(--input-bg)] p-6 rounded-lg">
                                <ReactMarkdown
                                  components={{
                                    h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-[var(--foreground)]">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-semibold mt-6 mb-3 text-[var(--foreground)]">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-md font-semibold mt-4 mb-2 text-[var(--foreground)]">{children}</h3>,
                                    p: ({ children }) => <p className="mb-3 text-[var(--foreground)]">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-[var(--foreground)]">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-[var(--foreground)]">{children}</strong>,
                                    code: ({ children }) => <code className="bg-[var(--border)] px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                                    pre: ({ children }) => <pre className="bg-[var(--card-bg)] p-4 rounded-lg overflow-x-auto my-4">{children}</pre>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-[var(--accent)] pl-4 italic my-4">{children}</blockquote>,
                                  }}
                                >
                                  {aiAnalysis.ai_analysis}
                                </ReactMarkdown>
                              </div>
                            )}

                            {/* Empty State */}
                            {!aiAnalysis && !aiLoading && !aiError && (
                              <div className="flex flex-col items-center justify-center py-12 text-center bg-[var(--input-bg)] rounded-lg">
                                <Sparkles className="w-12 h-12 text-[var(--muted)] mb-4" />
                                <h3 className="font-semibold mb-2">AI Analysis Available</h3>
                                <p className="text-sm text-[var(--muted)] max-w-md">
                                  Click the &quot;Analyze&quot; button to have AI review this submission and provide insights on the student&apos;s work.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          // IT/OT Logs Content
                          <>
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
                          </>
                        )}
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
