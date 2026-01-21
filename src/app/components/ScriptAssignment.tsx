import React, { useState } from "react";
import { FileCode, ChevronDown, ChevronUp, Plus, Trash2, Info } from "lucide-react";
import { ScriptListItem, ScriptAssignment as ScriptAssignmentType } from "../types/topology";

interface ScriptAssignmentProps {
  scripts: ScriptListItem[];
  deviceTypes: string[];
  assignments: ScriptAssignmentType[];
  onAssignmentsChange: (assignments: ScriptAssignmentType[]) => void;
}

const ScriptAssignment: React.FC<ScriptAssignmentProps> = ({
  scripts,
  deviceTypes,
  assignments,
  onAssignmentsChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const addAssignment = () => {
    if (deviceTypes.length === 0 || scripts.length === 0) return;
    
    const newAssignment: ScriptAssignmentType = {
      deviceType: deviceTypes[0],
      scriptId: scripts[0].id,
      remotePath: "/tmp/script.sh",
      priority: 10,
    };
    onAssignmentsChange([...assignments, newAssignment]);
  };

  const updateAssignment = (index: number, updates: Partial<ScriptAssignmentType>) => {
    const updated = [...assignments];
    updated[index] = { ...updated[index], ...updates };
    onAssignmentsChange(updated);
  };

  const removeAssignment = (index: number) => {
    onAssignmentsChange(assignments.filter((_, i) => i !== index));
  };

  const getScriptName = (scriptId: string) => {
    return scripts.find((s) => s.id === scriptId)?.name || "Unknown Script";
  };

  return (
    <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 w-full text-left"
      >
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
        <h2 className="text-xl font-semibold text-gray-100">
          Script Assignment {assignments.length > 0 && `(${assignments.length})`}
        </h2>
      </button>

      {isExpanded && (
        <div className="mt-4">
          {/* Info Box */}
          <div className="mb-4 p-3 bg-[#252535] rounded-lg border border-[#3a3a4e] flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              Assign scripts to device types. When you build the scenario, these scripts will be
              automatically pushed and executed on all nodes of the assigned device type. Lower
              priority values run first (e.g., DHCP server at priority 1, clients at priority 10).
            </p>
          </div>

          {scripts.length === 0 ? (
            <div className="text-center py-6">
              <FileCode className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                No scripts available. Create scripts in the Script Library first.
              </p>
            </div>
          ) : deviceTypes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">
                No devices configured. Add devices in the topology configuration above.
              </p>
            </div>
          ) : (
            <>
              {/* Assignment List */}
              <div className="space-y-3 mb-4">
                {assignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-[#333347] rounded-lg border border-[#3a3a4e]"
                  >
                    {/* Device Type */}
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Device Type</label>
                      <select
                        value={assignment.deviceType}
                        onChange={(e) =>
                          updateAssignment(index, { deviceType: e.target.value })
                        }
                        className="w-full px-2 py-1.5 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        {deviceTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Script */}
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Script</label>
                      <select
                        value={assignment.scriptId}
                        onChange={(e) =>
                          updateAssignment(index, { scriptId: e.target.value })
                        }
                        className="w-full px-2 py-1.5 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        {scripts.map((script) => (
                          <option key={script.id} value={script.id}>
                            {script.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remote Path */}
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Remote Path</label>
                      <input
                        type="text"
                        value={assignment.remotePath}
                        onChange={(e) =>
                          updateAssignment(index, { remotePath: e.target.value })
                        }
                        className="w-full px-2 py-1.5 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    {/* Priority */}
                    <div className="w-20">
                      <label className="block text-xs text-gray-400 mb-1">Priority</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={assignment.priority}
                        onChange={(e) =>
                          updateAssignment(index, {
                            priority: parseInt(e.target.value) || 10,
                          })
                        }
                        className="w-full px-2 py-1.5 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeAssignment(index)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors mt-4"
                      title="Remove assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Button */}
              <button
                onClick={addAssignment}
                className="flex items-center space-x-2 px-3 py-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Script Assignment</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ScriptAssignment;
