"use client";

import { useState, useCallback } from "react";
import {
  LoggingSetupRequest,
  LoggingSetupResponse,
  LoggingStatusResponse,
  LogPreviewResponse,
  LogSubmissionResponse,
  LoggingTeardownResponse,
} from "../types/topology";

interface GNS3Credentials {
  gns3_server_ip: string;
  gns3_server_port?: number;
  username?: string;
  password?: string;
}

export function useLogging(studentName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LoggingStatusResponse | null>(null);
  const [preview, setPreview] = useState<LogPreviewResponse | null>(null);

  const encodedName = encodeURIComponent(studentName);

  const setupLogging = useCallback(
    async (request: LoggingSetupRequest): Promise<LoggingSetupResponse | null> => {
      if (!studentName) {
        setError("Student name is required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/logging/${encodedName}/setup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to setup logging");
        }

        // Refresh status after setup
        await fetchStatus();
        return data as LoggingSetupResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [studentName, encodedName]
  );

  const fetchStatus = useCallback(async (): Promise<LoggingStatusResponse | null> => {
    if (!studentName) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/logging/${encodedName}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch status");
      }

      setStatus(data);
      return data as LoggingStatusResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [studentName, encodedName]);

  const fetchPreview = useCallback(
    async (credentials: GNS3Credentials): Promise<LogPreviewResponse | null> => {
      if (!studentName) {
        setError("Student name is required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          gns3_server_ip: credentials.gns3_server_ip,
          ...(credentials.gns3_server_port && {
            gns3_server_port: String(credentials.gns3_server_port),
          }),
          ...(credentials.username && { username: credentials.username }),
          ...(credentials.password && { password: credentials.password }),
        });

        const response = await fetch(`/api/logging/${encodedName}/preview?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to preview logs");
        }

        setPreview(data);
        return data as LogPreviewResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [studentName, encodedName]
  );

  const submitLogs = useCallback(
    async (credentials: GNS3Credentials): Promise<LogSubmissionResponse | null> => {
      if (!studentName) {
        setError("Student name is required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/logging/${encodedName}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to submit logs");
        }

        return data as LogSubmissionResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [studentName, encodedName]
  );

  const teardownLogging = useCallback(
    async (credentials: GNS3Credentials): Promise<LoggingTeardownResponse | null> => {
      if (!studentName) {
        setError("Student name is required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          gns3_server_ip: credentials.gns3_server_ip,
          ...(credentials.gns3_server_port && {
            gns3_server_port: String(credentials.gns3_server_port),
          }),
          ...(credentials.username && { username: credentials.username }),
          ...(credentials.password && { password: credentials.password }),
        });

        const response = await fetch(`/api/logging/${encodedName}/teardown?${params}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to teardown logging");
        }

        // Clear status after teardown
        setStatus(null);
        setPreview(null);
        return data as LoggingTeardownResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [studentName, encodedName]
  );

  return {
    loading,
    error,
    status,
    preview,
    setupLogging,
    fetchStatus,
    fetchPreview,
    submitLogs,
    teardownLogging,
    clearError: () => setError(null),
  };
}
