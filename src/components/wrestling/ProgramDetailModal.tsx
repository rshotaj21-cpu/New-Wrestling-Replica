import { useState } from "react";
import { X, Trash2, Play, Edit3, ChevronDown, ChevronUp, Link2, Calendar, Dumbbell, Zap, Activity } from "lucide-react";
import { useData, SCProgram, ProgramWeek } from "@/context/DataContext";

interface ProgramDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: SCProgram;
  onStartSession: (programId: string, weekNumber: number, sessionIndex: number) => void;
}

export function ProgramDetailModal({ isOpen, onClose, program, onStartSession }: ProgramDetailModalProps) {
  const { updateProgram, deleteProgram, sessions } = useData();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(program.name);
  const [editDuration, setEditDuration] = useState(program.duration);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const linkedSessions = sessions.filter(s => s.programId === program.id);
  const typeIcons: Record<string, typeof Dumbbell> = { Strength: Dumbbell, Power: Zap, Conditioning: Activity };

  const handleSave = () => {
    updateProgram(program.id, { ...program, name: editName, duration: editDuration });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteProgram(program.id);
    onClose();
  };

  const handleToggleActive = () => {
    updateProgram(program.id, {
      ...program,
      isActive: !program.isActive,
      startDate: !program.isActive ? new Date().toISOString().split("T")[0] : program.startDate,
    });
  };

  const handleDeleteSession = (weekNumber: number, sessionIndex: number) => {
    const updatedWeeks = program.weeks.map(w =>
      w.weekNumber === weekNumber
        ? { ...w, sessions: w.sessions.filter((_, i) => i !== sessionIndex) }
        : w
    );
    updateProgram(program.id, { ...program, weeks: updatedWeeks });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between mb-2">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-2 py-1 flex-1 mr-2"
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900">{program.name}</h2>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${program.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {program.isActive ? "Active" : "Inactive"}
            </span>
            {isEditing ? (
              <div className="flex items-center gap-1 text-sm">
                <input type="number" min="1" max="52" value={editDuration} onChange={(e) => setEditDuration(parseInt(e.target.value))} className="w-16 border border-gray-300 rounded px-2 py-0.5 text-sm" />
                <span className="text-gray-500">weeks</span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">{program.duration} weeks • Created {program.createdDate}</span>
            )}
            {program.startDate && <span className="text-xs text-gray-500">• Started {program.startDate}</span>}
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleToggleActive}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${program.isActive ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700"}`}
            >
              {program.isActive ? "Deactivate" : "Activate"}
            </button>
            {isEditing ? (
              <>
                <button onClick={handleSave} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
                <button onClick={() => { setIsEditing(false); setEditName(program.name); setEditDuration(program.duration); }} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            <button onClick={() => setConfirmDelete(true)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-1 ml-auto">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800 font-medium mb-3">Delete "{program.name}"? This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Yes, delete</button>
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        {/* Linked sessions summary */}
        {linkedSessions.length > 0 && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-blue-800 font-medium">
              <Link2 className="w-4 h-4" />
              {linkedSessions.length} session{linkedSessions.length !== 1 ? "s" : ""} linked to this program
            </div>
          </div>
        )}

        {/* Weekly breakdown */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Weekly Breakdown</h3>
          {program.weeks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No weeks configured yet.</p>
          ) : (
            program.weeks.map((week) => (
              <div key={week.weekNumber} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Week {week.weekNumber}</span>
                    <span className="text-xs text-gray-500">{week.sessions.length} session{week.sessions.length !== 1 ? "s" : ""}</span>
                  </div>
                  {expandedWeek === week.weekNumber ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedWeek === week.weekNumber && (
                  <div className="p-3 space-y-3">
                    {week.sessions.map((session, idx) => {
                      const Icon = typeIcons[session.type] || Dumbbell;
                      return (
                        <div key={idx} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray-600" />
                              <span className="font-medium text-sm text-gray-900">{session.day}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                session.type === "Strength" ? "bg-orange-100 text-orange-700" :
                                session.type === "Power" ? "bg-purple-100 text-purple-700" :
                                "bg-red-100 text-red-700"
                              }`}>{session.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onStartSession(program.id, week.weekNumber, idx)}
                                className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                title="Start this session"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSession(week.weekNumber, idx)}
                                className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                title="Remove session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">Focus: {session.focus}</div>
                          <div className="space-y-1">
                            {session.exercises.map((ex, exIdx) => (
                              <div key={exIdx} className="text-xs bg-gray-50 rounded px-2 py-1.5 text-gray-700">
                                <span className="font-medium">{ex.exerciseName}</span> — {ex.sets}×{ex.reps} @ {ex.weight}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
