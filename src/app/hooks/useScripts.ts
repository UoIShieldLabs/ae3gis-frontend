import { useState, useEffect, useCallback } from "react";
import { Script, ScriptListItem } from "../types/topology";

export function useScripts() {
  const [scripts, setScripts] = useState<ScriptListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all scripts
  const fetchScripts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gns3/scripts", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch scripts");
      }

      const data = await response.json();
      setScripts(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch scripts";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single script by ID (includes content)
  const fetchScriptById = async (id: string): Promise<Script> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gns3/scripts/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch script");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch script";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new script
  const createScript = async (
    name: string,
    content: string,
    description: string = ""
  ): Promise<Script> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gns3/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to create script");
      }

      const data = await response.json();

      // Refresh the list after creating
      await fetchScripts();

      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create script";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a script
  const updateScript = async (
    id: string,
    updates: { name?: string; description?: string; content?: string }
  ): Promise<Script> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gns3/scripts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update script");
      }

      const data = await response.json();

      // Refresh the list after updating
      await fetchScripts();

      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update script";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a script
  const deleteScript = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gns3/scripts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete script");
      }

      // Refresh the list after deleting
      await fetchScripts();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete script";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  return {
    scripts,
    loading,
    error,
    fetchScripts,
    fetchScriptById,
    createScript,
    updateScript,
    deleteScript,
  };
}
