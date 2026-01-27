"use client";

import { useState, useCallback } from "react";
import {
  StudentInfo,
  StudentsListResponse,
  SubmissionSummary,
  SubmissionsListResponse,
  SubmissionDetail,
  DeleteResponse,
} from "../types/topology";

export function useStudentManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);

  const fetchStudents = useCallback(async (): Promise<StudentsListResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/instructor/students");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch students");
      }

      setStudents(data.students || []);
      return data as StudentsListResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(
    async (studentName: string): Promise<DeleteResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/instructor/students/${encodeURIComponent(studentName)}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to delete student");
        }

        // Refresh students list
        await fetchStudents();
        return data as DeleteResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchStudents]
  );

  const fetchSubmissions = useCallback(
    async (studentName?: string): Promise<SubmissionsListResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        let url = "/api/instructor/submissions";
        if (studentName) {
          url += `?student_name=${encodeURIComponent(studentName)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch submissions");
        }

        setSubmissions(data.submissions || []);
        return data as SubmissionsListResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSubmissionDetail = useCallback(
    async (studentName: string, submissionId: string): Promise<SubmissionDetail | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/instructor/submissions/${encodeURIComponent(studentName)}/${encodeURIComponent(submissionId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch submission detail");
        }

        return data as SubmissionDetail;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteSubmission = useCallback(
    async (studentName: string, submissionId: string): Promise<DeleteResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/instructor/submissions/${encodeURIComponent(studentName)}/${encodeURIComponent(submissionId)}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to delete submission");
        }

        // Refresh submissions list
        await fetchSubmissions();
        return data as DeleteResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubmissions]
  );

  const resetAll = useCallback(
    async (target: "submissions" | "students" | "all"): Promise<DeleteResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/instructor/reset/${target}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to reset");
        }

        // Refresh both lists
        await fetchStudents();
        await fetchSubmissions();
        return data as DeleteResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchStudents, fetchSubmissions]
  );

  return {
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
    clearError: () => setError(null),
  };
}
