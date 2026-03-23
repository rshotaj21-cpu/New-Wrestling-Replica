import { useState } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, Plus, Pencil, Trash2, ChevronRight, Video, Flame, ClipboardList, CheckCircle2 } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { useData, Technique, TechniqueGoal } from "@/context/DataContext";
import { TechniqueModal } from "./TechniqueModal";
import { TechniqueGoalModal } from "./TechniqueGoalModal";
import { LogRepsModal } from "./LogRepsModal";

const categoryColors: Record<string, string> = {
  Neutral: "bg-blue-100 text-blue-700",
  Top: "bg-green-100 text-green-700",
  Bottom: "bg-orange-100 text-orange-700",
};

type FilterCategory = "All" | "Neutral" | "Top" | "Bottom";

export function Techniques() {
  const { techniques, addTechnique, updateTechnique, deleteTechnique } = useData();
  const [filter, setFilter] = useState<FilterCategory>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTechnique, setEditingTechnique] = useState<Technique | undefined>();
  const [goalTechnique, setGoalTechnique] = useState<Technique | undefined>();
  const [completingGoal, setCompletingGoal] = useState<{ technique: Technique; goal: TechniqueGoal } | undefined>();
  const [loggingReps, setLoggingReps] = useState<{ technique: Technique; goal: TechniqueGoal } | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = filter === "All" ? techniques : techniques.filter((t) => t.category === filter);

  const handleSaveNew = (technique: Technique) => {
    addTechnique(technique);
  };

  const handleSaveEdit = (technique: Technique) => {
    updateTechnique(technique.id, technique);
    setEditingTechnique(undefined);
  };

  const handleDelete = (id: string) => {
    deleteTechnique(id);
    setShowDeleteConfirm(null);
    setExpandedId(null);
  };

  const handleGoalSave = (technique: Technique) => {
    updateTechnique(technique.id, technique);
  };

  const getActiveGoal = (t: Technique): TechniqueGoal | undefined =>
    t.goals?.find((g) => g.status === "active");

  const successRate = (t: Technique) =>
    t.attempts > 0 ? Math.round((t.finishes / t.attempts) * 100) : 0;

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Techniques</h1>
          <p className="text-sm text-gray-500">Track your arsenal</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-[0.97] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["All", "Neutral", "Top", "Bottom"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === c ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Technique Cards */}
      <div className="space-y-3">
        {filtered.map((technique, index) => {
          const rate = successRate(technique);
          const activeGoal = getActiveGoal(technique);
          const isExpanded = expandedId === technique.id;

          return (
            <motion.div
              key={technique.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Main card */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : technique.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{technique.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-md ${categoryColors[technique.category]}`}>
                      {technique.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {activeGoal && <Flame className="w-4 h-4 text-orange-500" />}
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Attempts</div>
                    <div className="text-lg font-bold text-gray-900">{technique.attempts}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Successful</div>
                    <div className="text-lg font-bold text-green-600">{technique.finishes}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Success %</div>
                    <div className="text-lg font-bold text-blue-600">{rate}%</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Success Rate</span>
                  </div>
                  <ProgressBar
                    value={rate}
                    className="bg-gray-100"
                    barClassName={
                      rate >= 75
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : rate >= 65
                        ? "bg-gradient-to-r from-blue-400 to-blue-500"
                        : "bg-gradient-to-r from-orange-400 to-orange-500"
                    }
                  />
                </div>

                {/* Active goal progress */}
                {activeGoal && (
                  <div className="mt-3 bg-orange-50 rounded-lg p-2.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-orange-800 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Goal: {activeGoal.targetReps} reps ({activeGoal.period})
                      </span>
                      <span className="text-orange-600">{activeGoal.completedReps}/{activeGoal.targetReps}</span>
                    </div>
                    <ProgressBar
                      value={Math.min(100, Math.round((activeGoal.completedReps / activeGoal.targetReps) * 100))}
                      className="bg-orange-100 h-1.5"
                      barClassName="bg-gradient-to-r from-orange-400 to-orange-500"
                    />
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="border-t border-gray-100 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {/* Setups */}
                    {technique.setups && technique.setups.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Setups</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {technique.setups.map((s, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video Links */}
                    {technique.videoLinks && technique.videoLinks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Videos
                        </h4>
                        {technique.videoLinks.map((v, i) => (
                          <a
                            key={i}
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-600 hover:underline mb-1"
                          >
                            {v.title}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Goal info */}
                    {activeGoal && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Active Goal</h4>
                        <div className="bg-gray-50 rounded-lg p-2.5 text-sm space-y-1">
                          <p><span className="text-gray-500">Focus:</span> {activeGoal.focusReason}</p>
                          <p><span className="text-gray-500">Period:</span> {activeGoal.startDate} → {activeGoal.endDate}</p>
                          <p><span className="text-gray-500">Progress:</span> {activeGoal.completedReps} / {activeGoal.targetReps} reps</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setLoggingReps({ technique, goal: activeGoal }); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100"
                          >
                            <ClipboardList className="w-3.5 h-3.5" /> Log Reps
                          </button>
                          {activeGoal.completedReps >= activeGoal.targetReps && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setCompletingGoal({ technique, goal: activeGoal }); }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Completed goals */}
                    {technique.goals?.filter((g) => g.status === "completed").length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Past Goals</h4>
                        {technique.goals.filter((g) => g.status === "completed").map((g) => (
                          <div key={g.id} className="bg-green-50 rounded-lg p-2 text-xs text-green-800 mb-1">
                            <p className="font-medium">✓ {g.targetReps} reps ({g.period}) — {g.completedReps} done</p>
                            {g.completionReflection && (
                              <p className="text-green-600 mt-0.5">{g.completionReflection.whatWentWell}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      {!activeGoal && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setGoalTechnique(technique); }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100"
                        >
                          <Target className="w-3.5 h-3.5" /> Set Goal
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingTechnique(technique); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      {showDeleteConfirm === technique.id ? (
                        <div className="flex gap-1.5">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(technique.id); }} className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-medium">Confirm</button>
                          <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(null); }} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(technique.id); }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No techniques yet</p>
            <button onClick={() => setShowAddModal(true)} className="text-sm text-blue-600 mt-1 hover:underline">Add your first technique</button>
          </div>
        )}
      </div>

      {/* Modals */}
      <TechniqueModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveNew}
      />

      {editingTechnique && (
        <TechniqueModal
          isOpen={!!editingTechnique}
          onClose={() => setEditingTechnique(undefined)}
          onSave={handleSaveEdit}
          techniqueToEdit={editingTechnique}
        />
      )}

      {goalTechnique && (
        <TechniqueGoalModal
          isOpen={!!goalTechnique}
          onClose={() => setGoalTechnique(undefined)}
          technique={goalTechnique}
          onSave={handleGoalSave}
        />
      )}

      {completingGoal && (
        <TechniqueGoalModal
          isOpen={!!completingGoal}
          onClose={() => setCompletingGoal(undefined)}
          technique={completingGoal.technique}
          onSave={handleGoalSave}
          goalToComplete={completingGoal.goal}
        />
      )}

      {loggingReps && (
        <LogRepsModal
          isOpen={!!loggingReps}
          onClose={() => setLoggingReps(undefined)}
          technique={loggingReps.technique}
          goal={loggingReps.goal}
          onSave={handleGoalSave}
        />
      )}
    </div>
  );
}
