import { useState, useCallback } from "react";
import { DeployScenarioRequest, DeployScenarioResponse } from "../types/topology";

export function useDeploy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeployScenarioResponse | null>(null);

  const deploy = useCallback(
    async (
      scenarioId: string,
      config: DeployScenarioRequest
    ): Promise<DeployScenarioResponse | null> => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch(`/api/scenarios/${scenarioId}/deploy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to deploy scenario");
        }

        const data: DeployScenarioResponse = await response.json();
        setResult(data);
        return data;
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

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    loading,
    error,
    result,
    deploy,
    reset,
  };
}
