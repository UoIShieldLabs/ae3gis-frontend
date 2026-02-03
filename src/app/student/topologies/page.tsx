"use client";

import { useState } from "react";
import { ArrowLeft, Network, Rocket } from "lucide-react";
import { useTopologies } from "../../hooks/useTopologies";
import { useSettings } from "../../contexts/SettingsContext";
import { Topology, TopologyListItem } from "../../types/topology";

type View = "list" | "detail";

export default function StudentTopologiesPage() {
  const { topologies, loading, error, fetchTopology } = useTopologies();
  const { settings } = useSettings();

  const [view, setView] = useState<View>("list");
  const [selectedTopology, setSelectedTopology] = useState<Topology | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  const handleView = async (id: string) => {
    const topology = await fetchTopology(id);
    if (topology) {
      setSelectedTopology(topology);
      setView("detail");
    }
  };

  const handleBack = () => {
    setView("list");
    setSelectedTopology(null);
    setDeployError(null);
    setDeploySuccess(null);
  };

  const handleDeploy = async () => {
    if (!selectedTopology) return;

    setDeploying(true);
    setDeployError(null);
    setDeploySuccess(null);

    try {
      const response = await fetch(`/api/topologies/${selectedTopology.id}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gns3_server_ip: settings.gns3ServerIp,
          gns3_server_port: settings.gns3ServerPort,
          username: settings.gns3Username,
          password: settings.gns3Password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to deploy topology");
      }

      const data = await response.json();
      setDeploySuccess(`Topology deployed successfully! Project: ${data.project_name || selectedTopology.name}`);
    } catch (err) {
      setDeployError(err instanceof Error ? err.message : "Failed to deploy topology");
    } finally {
      setDeploying(false);
    }
  };

  // Helper to format link display
  const formatLink = (link: { nodes: { name: string; adapter_number: number; port_number: number }[] }) => {
    if (link.nodes.length >= 2) {
      const [a, b] = link.nodes;
      return `${a.name} (${a.adapter_number}/${a.port_number}) ↔ ${b.name} (${b.adapter_number}/${b.port_number})`;
    }
    return "Invalid link";
  };

  // Detail View
  if (view === "detail" && selectedTopology) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-[var(--accent)]" />
              <h1 className="text-2xl font-bold">{selectedTopology.name}</h1>
            </div>
            {selectedTopology.description && (
              <p className="text-[var(--muted)] mt-1">{selectedTopology.description}</p>
            )}
          </div>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            <Rocket className="w-4 h-4" />
            {deploying ? "Deploying..." : "Deploy"}
          </button>
        </div>

        {/* Messages */}
        {deployError && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
            {deployError}
          </div>
        )}
        {deploySuccess && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
            {deploySuccess}
          </div>
        )}

        {/* Topology Details */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Topology Details</h2>

          {/* Nodes */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Nodes ({selectedTopology.definition?.nodes?.length || 0})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {selectedTopology.definition?.nodes?.map((node, index) => (
                <div
                  key={index}
                  className="px-3 py-2 bg-[var(--input-bg)] rounded-lg text-sm"
                >
                  <span className="font-medium">{node.name}</span>
                  {node.template_name && (
                    <span className="text-[var(--muted)] ml-2">{node.template_name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {selectedTopology.definition?.links && selectedTopology.definition.links.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Links ({selectedTopology.definition.links.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedTopology.definition.links.map((link, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-[var(--input-bg)] rounded-lg text-sm"
                  >
                    {formatLink(link)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Topologies</h1>
        <p className="text-[var(--muted)]">
          Browse and deploy network lab topologies
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Topology List */}
      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">
          Loading topologies...
        </div>
      ) : topologies.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-12 text-center">
          <Network className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Topologies Available</h3>
          <p className="text-[var(--muted)]">
            Check back later for available network topologies
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {topologies.map((topology: TopologyListItem) => (
            <div
              key={topology.id}
              onClick={() => handleView(topology.id)}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <Network className="w-5 h-5 text-[var(--accent)]" />
                    <h3 className="font-medium">{topology.name}</h3>
                  </div>
                  {topology.description && (
                    <p className="text-sm text-[var(--muted)] mb-2">{topology.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                    <span>Created: {new Date(topology.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Rocket className="w-5 h-5 text-[var(--muted)]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
