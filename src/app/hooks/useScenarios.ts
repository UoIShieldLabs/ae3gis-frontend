import { useState, useEffect, useCallback } from "react";
import {
  Scenario,
  ScenarioListItem,
  CreateScenarioRequest,
  UpdateScenarioRequest,
  ExecuteScriptRequest,
  ExecuteScriptResponse,
  ListProjectNodesResponse,
} from "../types/scenario";

export function useScenarios() {
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all scenarios
  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/scenarios");
      if (!response.ok) {
        throw new Error("Failed to fetch scenarios");
      }
      const data = await response.json();
      setScenarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single scenario by ID
  const fetchScenario = useCallback(async (id: string): Promise<Scenario | null> => {
    try {
      const response = await fetch(`/api/scenarios/${id}`);
      if (!response.ok) {
        throw new Error("Scenario not found");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, []);

  // Create a new scenario
  const createScenario = useCallback(
    async (data: CreateScenarioRequest): Promise<Scenario | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/scenarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create scenario");
        }
        const created = await response.json();
        setScenarios((prev) => [...prev, created]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update an existing scenario
  const updateScenario = useCallback(
    async (id: string, data: UpdateScenarioRequest): Promise<Scenario | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/scenarios/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update scenario");
        }
        const updated = await response.json();
        setScenarios((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a scenario
  const deleteScenario = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scenarios/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete scenario");
      }
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute script on nodes (upload with optional execution)
  const executeScript = useCallback(
    async (request: ExecuteScriptRequest): Promise<ExecuteScriptResponse | null> => {
      try {
        const response = await fetch("/api/scenarios/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to execute script");
        }
        return await response.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    []
  );

  // Fetch project nodes (for script target selection)
  const fetchProjectNodes = useCallback(
    async (
      projectName: string,
      serverIp: string,
      serverPort: number = 80,
      username: string = "gns3",
      password: string = "gns3"
    ): Promise<ListProjectNodesResponse | null> => {
      try {
        const params = new URLSearchParams({
          server_ip: serverIp,
          server_port: serverPort.toString(),
          username,
          password,
        });
        const response = await fetch(
          `/api/topologies/projects/${encodeURIComponent(projectName)}/nodes?${params}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project nodes");
        }
        return await response.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    []
  );

  // Load scenarios on mount
  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  return {
    scenarios,
    loading,
    error,
    fetchScenarios,
    fetchScenario,
    createScenario,
    updateScenario,
    deleteScenario,
    executeScript,
    fetchProjectNodes,
  };
}
