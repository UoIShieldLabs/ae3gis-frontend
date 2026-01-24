"use client";

import { useState } from "react";
import { Plus, ArrowLeft, Rocket, Edit, Network, Calendar, Trash2 } from "lucide-react";
import { useScenarios } from "../../hooks/useScenarios";
import ScenarioList from "../../components/ScenarioList";
import ScenarioForm from "../../components/ScenarioForm";
import DeployForm from "../../components/DeployForm";
import { Scenario, CreateScenarioRequest } from "../../types/topology";

type View = "list" | "create" | "edit" | "detail";

export default function InstructorScenariosPage() {
  const {
    scenarios,
    loading,
    error,
    fetchScenarios,
    fetchScenario,
    createScenario,
    updateScenario,
    deleteScenario,
  } = useScenarios();

  const [view, setView] = useState<View>("list");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedScenario(null);
    setView("create");
  };

  const handleView = async (id: string) => {
    const scenario = await fetchScenario(id);
    if (scenario) {
      setSelectedScenario(scenario);
      setView("detail");
    }
  };

  const handleEdit = async (id: string) => {
    const scenario = await fetchScenario(id);
    if (scenario) {
      setSelectedScenario(scenario);
      setView("edit");
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await deleteScenario(id);
      setDeleteConfirm(null);
      if (view === "detail") {
        setView("list");
        setSelectedScenario(null);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleSave = async (data: CreateScenarioRequest): Promise<Scenario | null> => {
    let result: Scenario | null = null;

    if (view === "edit" && selectedScenario) {
      result = await updateScenario(selectedScenario.id, data);
    } else {
      result = await createScenario(data);
    }

    if (result) {
      setView("list");
      setSelectedScenario(null);
      fetchScenarios();
    }

    return result;
  };

  const handleCancel = () => {
    setView("list");
    setSelectedScenario(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Detail View with Deploy
  if (view === "detail" && selectedScenario) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-[var(--accent)]" />
              <h1 className="text-2xl font-bold">{selectedScenario.name}</h1>
            </div>
            {selectedScenario.description && (
              <p className="text-[var(--muted)] mt-1">{selectedScenario.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("edit")}
              className="flex items-center gap-2 px-4 py-2 text-[var(--accent)] border border-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/10 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(selectedScenario.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                deleteConfirm === selectedScenario.id
                  ? "bg-[var(--danger)] text-white"
                  : "text-[var(--danger)] border border-[var(--danger)] hover:bg-[var(--danger)]/10"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {deleteConfirm === selectedScenario.id ? "Confirm Delete" : "Delete"}
            </button>
          </div>
        </div>

        {/* Scenario Info */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-[var(--muted)]">Project Name:</span>
              <span className="ml-2 font-medium">{selectedScenario.definition.project_name}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Total Nodes:</span>
              <span className="ml-2 font-medium">{selectedScenario.definition.nodes.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--muted)]" />
              <span className="text-[var(--muted)]">Created:</span>
              <span className="ml-1">{formatDate(selectedScenario.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--muted)]" />
              <span className="text-[var(--muted)]">Updated:</span>
              <span className="ml-1">{formatDate(selectedScenario.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Deploy Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-[var(--success)]" />
            <h2 className="text-lg font-semibold">Deploy Scenario</h2>
          </div>
          <DeployForm scenario={selectedScenario} />
        </div>

        {/* Node Summary */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Nodes Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedScenario.definition.nodes.map((node, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-lg"
              >
                <div>
                  <span className="font-medium">{node.name}</span>
                  <span className="text-xs text-[var(--muted)] ml-2">{node.layer}</span>
                </div>
                <span className="text-xs text-[var(--muted)]">{node.template_key || node.template_name || "N/A"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List View
  if (view === "list") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scenarios</h1>
            <p className="text-[var(--muted)]">
              Create and manage network lab scenarios
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Scenario
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)] px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-[var(--danger)]">
              Click delete again to confirm deletion
            </span>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Scenario List */}
        <ScenarioList
          scenarios={scenarios}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  // Create/Edit View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {view === "edit" ? "Edit Scenario" : "Create Scenario"}
          </h1>
          <p className="text-[var(--muted)]">
            {view === "edit"
              ? `Editing: ${selectedScenario?.name}`
              : "Build a new network lab scenario"}
          </p>
        </div>
      </div>

      {/* Form */}
      <ScenarioForm
        initialScenario={selectedScenario || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
