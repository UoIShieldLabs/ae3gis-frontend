import React, { useState } from "react";
import { Plus, Edit2, Trash2, Save, X, FileCode, ChevronDown, ChevronUp } from "lucide-react";
import { useScripts } from "../hooks/useScripts";
import { Script, ScriptListItem } from "../types/topology";

interface ScriptEditorProps {
  script?: Script | null;
  onSave: (name: string, content: string, description: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  onSave,
  onCancel,
  loading,
}) => {
  const [name, setName] = useState(script?.name || "");
  const [description, setDescription] = useState(script?.description || "");
  const [content, setContent] = useState(script?.content || "#!/bin/sh\n\n");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    await onSave(name, content, description);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Script Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Start DHCP Server"
            disabled={loading}
            className="w-full px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
            disabled={loading}
            className="w-full px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Script Content <span className="text-red-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your shell commands here..."
          rows={12}
          disabled={loading}
          className="w-full px-3 py-2 bg-[#1a1a2e] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-y disabled:opacity-50"
          style={{ minHeight: "200px" }}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !name.trim() || !content.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Saving..." : script ? "Update Script" : "Create Script"}</span>
        </button>
      </div>
    </form>
  );
};

interface ScriptListCardProps {
  script: ScriptListItem;
  onEdit: () => void;
  onDelete: () => void;
}

const ScriptListCard: React.FC<ScriptListCardProps> = ({
  script,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-[#333347] rounded-lg border border-[#3a3a4e] hover:border-indigo-500/50 transition-colors">
      <div className="flex items-center space-x-3">
        <FileCode className="w-5 h-5 text-indigo-400" />
        <div>
          <h4 className="font-medium text-gray-100">{script.name}</h4>
          {script.description && (
            <p className="text-sm text-gray-400">{script.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/20 rounded transition-colors"
          title="Edit script"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
          title="Delete script"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ScriptLibrary: React.FC = () => {
  const {
    scripts,
    loading,
    error,
    fetchScriptById,
    createScript,
    updateScript,
    deleteScript,
  } = useScripts();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);

  const handleCreateNew = () => {
    setEditingScript(null);
    setShowEditor(true);
  };

  const handleEdit = async (scriptId: string) => {
    try {
      setEditorLoading(true);
      const script = await fetchScriptById(scriptId);
      setEditingScript(script);
      setShowEditor(true);
    } catch (err) {
      console.error("Failed to fetch script for editing:", err);
    } finally {
      setEditorLoading(false);
    }
  };

  const handleDelete = async (scriptId: string, scriptName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${scriptName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteScript(scriptId);
    } catch (err) {
      console.error("Failed to delete script:", err);
      alert("Failed to delete script. Please try again.");
    }
  };

  const handleSave = async (name: string, content: string, description: string) => {
    try {
      setEditorLoading(true);
      if (editingScript) {
        await updateScript(editingScript.id, { name, content, description });
      } else {
        await createScript(name, content, description);
      }
      setShowEditor(false);
      setEditingScript(null);
    } catch (err) {
      console.error("Failed to save script:", err);
      alert("Failed to save script. Please try again.");
    } finally {
      setEditorLoading(false);
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingScript(null);
  };

  return (
    <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-gray-100 hover:text-indigo-400 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
          <h2 className="text-xl font-semibold">
            Script Library {scripts.length > 0 && `(${scripts.length})`}
          </h2>
        </button>

        {isExpanded && !showEditor && (
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Script</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <>
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {showEditor ? (
            <ScriptEditor
              script={editingScript}
              onSave={handleSave}
              onCancel={handleCancel}
              loading={editorLoading}
            />
          ) : (
            <>
              {loading && scripts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading scripts...</p>
                </div>
              ) : scripts.length === 0 ? (
                <div className="text-center py-8">
                  <FileCode className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">
                    No scripts yet. Create your first script to get started.
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Script</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {scripts.map((script) => (
                    <ScriptListCard
                      key={script.id}
                      script={script}
                      onEdit={() => handleEdit(script.id)}
                      onDelete={() => handleDelete(script.id, script.name)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ScriptLibrary;
