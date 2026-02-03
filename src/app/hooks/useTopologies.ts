import { useState, useEffect, useCallback } from "react";
import {
  Topology,
  TopologyListItem,
  CreateTopologyRequest,
  UpdateTopologyRequest,
} from "../types/topology";

export function useTopologies() {
  const [topologies, setTopologies] = useState<TopologyListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all topologies
  const fetchTopologies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/topologies");
      if (!response.ok) {
        throw new Error("Failed to fetch topologies");
      }
      const data = await response.json();
      setTopologies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single topology by ID
  const fetchTopology = useCallback(async (id: string): Promise<Topology | null> => {
    try {
      const response = await fetch(`/api/topologies/${id}`);
      if (!response.ok) {
        throw new Error("Topology not found");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, []);

  // Create a new topology
  const createTopology = useCallback(
    async (data: CreateTopologyRequest): Promise<Topology | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/topologies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create topology");
        }
        const created = await response.json();
        setTopologies((prev) => [...prev, created]);
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

  // Update an existing topology
  const updateTopology = useCallback(
    async (id: string, data: UpdateTopologyRequest): Promise<Topology | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/topologies/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update topology");
        }
        const updated = await response.json();
        setTopologies((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
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

  // Delete a topology
  const deleteTopology = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/topologies/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete topology");
      }
      setTopologies((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load topologies on mount
  useEffect(() => {
    fetchTopologies();
  }, [fetchTopologies]);

  return {
    topologies,
    loading,
    error,
    fetchTopologies,
    fetchTopology,
    createTopology,
    updateTopology,
    deleteTopology,
  };
}
