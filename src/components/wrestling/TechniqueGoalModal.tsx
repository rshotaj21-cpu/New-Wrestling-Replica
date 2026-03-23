import { useState } from "react";
import { X, Target, CheckCircle2 } from "lucide-react";
import { Technique, TechniqueGoal } from "@/context/DataContext";

interface TechniqueGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  technique: Technique;
  onSave: (technique: Technique) => void;
  goalToComplete?: TechniqueGoal;
}

export function TechniqueGoalModal({ isOpen, onClose, technique, onSave, goalToComplete }: TechniqueGoalModalProps) {
  // Completion mode
  const [whatWentWell, setWhatWentWell] = useState("");
  const [improvements, setImprovements] = useState("");

  // New goal mode
  const [targetReps, setTargetReps] = useState(50);
  const [period, setPeriod] = useState<TechniqueGoal["period"]>("weekly");
  const [customDays, setCustomDays] = useState(14);
  const [focusReason, setFocusReason] = useState("");

  if (!isOpen) return null;

  const isCompleting = !!goalToComplete;

  const handleComplete = () => {
    const updatedGoals = technique.goals.map((g) =>
      g.id === goalToComplete!.id
        ? { ...g, status: "completed" as const, completionReflection: { whatWentWell, improvements } }
        : g
    );
    onSave({ ...technique, goals: updatedGoals });
    onClose();
  };

  const handleCreateGoal = () => {
    if (!focusReason.trim()) return;
    const now = new Date();
    let endDate: string | undefined;
    if (period === "weekly") endDate = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);
    else if (period === "monthly") endDate = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
    else endDate = new Date(now.getTime() + customDays * 86400000).toISOString().slice(0, 10);

    const newGoal: TechniqueGoal = {
      id: `goal-${Date.now()}`,
      targetReps,
      completedReps: 0,
      period,
      customDays: period === "custom" ? customDays : undefined,
      startDate: now.toISOString().slice(0, 10),
      endDate,
      focusReason: focusReason.trim(),
      status: "active",
      repLogs: [],
    };
    onSave({ ...technique, goals: [...technique.goals, newGoal] });
    onClose();
  };

  if (isCompleting) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
        <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Goal Complete!</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-green-50 rounded-xl p-3 text-sm text-green-800">
              <p className="font-medium">{technique.name} — {goalToComplete!.targetReps} reps goal</p>
              <p className="text-green-600 mt-1">You completed {goalToComplete!.completedReps} reps!</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">What went well?</label>
              <textarea value={whatWentWell} onChange={(e) => setWhatWentWell(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-green-500" placeholder="What improved? What clicked?" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Still room for improvement?</label>
              <textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-green-500" placeholder="What still needs work?" />
            </div>
          </div>
          <div className="p-4 border-t border-gray-100">
            <button onClick={handleComplete} className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">Complete Goal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Set Goal — {technique.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Target Reps</label>
            <input type="number" value={targetReps} onChange={(e) => setTargetReps(Number(e.target.value))} min={1} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Time Period</label>
            <div className="flex gap-2">
              {(["weekly", "monthly", "custom"] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${period === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{p}</button>
              ))}
            </div>
            {period === "custom" && (
              <div className="mt-2">
                <label className="text-xs text-gray-500">Number of days</label>
                <input type="number" value={customDays} onChange={(e) => setCustomDays(Number(e.target.value))} min={1} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none mt-1" />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Why is this your focus?</label>
            <textarea value={focusReason} onChange={(e) => setFocusReason(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Need to improve finish rate on singles..." />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleCreateGoal} disabled={!focusReason.trim()} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40">Set Goal</button>
        </div>
      </div>
    </div>
  );
}
