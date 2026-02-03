"use client";

import { useState, useEffect } from "react";
import { Plus, ArrowLeft, Network } from "lucide-react";
import { useTopologies } from "../../hooks/useTopologies";
import TopologyList from "../../components/TopologyList";
import TopologyForm from "../../components/TopologyForm";
import TopologyDetailView from "../../components/TopologyDetailView";
import DeployForm from "../../components/DeployForm";
import { Topology, CreateTopologyRequest } from "../../types/topology";

type ViewMode = "list" | "create" | "edit" | "detail";

export default function InstructorTopologiesPage() {
  const {
    topologies,
    loading,
    error,
    fetchTopology,
    createTopology,
    updateTopology,
    deleteTopology,
    fetchTopologies,
  } = useTopologies();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTopology, setSelectedTopology] = useState<Topology | null>(null);
  const [loadingTopology, setLoadingTopology] = useState(false);

  // Handle view topology
  const handleView = async (id: string) => {
    setLoadingTopology(true);
    const topology = await fetchTopology(id);
    if (topology) {
      setSelectedTopology(topology);
      setViewMode("detail");
    }
    setLoadingTopology(false);
  };

  // Handle edit topology
  const handleEdit = async (id: string) => {
    setLoadingTopology(true);
    const topology = await fetchTopology(id);
    if (topology) {
      setSelectedTopology(topology);
      setViewMode("edit");
    }
    setLoadingTopology(false);
  };

  // Handle delete topology
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this topology?")) {
      await deleteTopology(id);
    }
  };

  // Handle save (create or update)
  const handleSave = async (data: CreateTopologyRequest): Promise<Topology | null> => {
    if (viewMode === "edit" && selectedTopology) {
      const result = await updateTopology(selectedTopology.id, data);
      if (result) {
        setViewMode("list");
        setSelectedTopology(null);
        fetchTopologies();
      }
      return result;
    } else {
      const result = await createTopology(data);
      if (result) {
        setViewMode("list");
        setSelectedTopology(null);
      }
      return result;
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setViewMode("list");
    setSelectedTopology(null);
  };

  // Render based on view mode
  if (viewMode === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
          <h1 className="text-2xl font-bold">Create New Topology</h1>
        </div>
        <TopologyForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    );
  }

  if (viewMode === "edit" && selectedTopology) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
          <h1 className="text-2xl font-bold">Edit Topology: {selectedTopology.name}</h1>
        </div>
        <TopologyForm
          initialTopology={selectedTopology}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  if (viewMode === "detail" && selectedTopology) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </button>
            <div>
              <h1 className="text-2xl font-bold">{selectedTopology.name}</h1>
              {selectedTopology.description && (
                <p className="text-[var(--muted)]">{selectedTopology.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => handleEdit(selectedTopology.id)}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            Edit Topology
          </button>
        </div>

        {/* Topology Detail View */}
        <TopologyDetailView topology={selectedTopology} readOnly />

        {/* Deploy Form */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Deploy Topology</h2>
          <DeployForm scenario={selectedTopology} onClose={handleCancel} />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Topologies</h1>
          <p className="text-[var(--muted)]">
            Create and manage network topology definitions
          </p>
        </div>
        <button
          onClick={() => setViewMode("create")}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Topology
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Topology List */}
      <TopologyList
        topologies={topologies}
        loading={loading || loadingTopology}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
