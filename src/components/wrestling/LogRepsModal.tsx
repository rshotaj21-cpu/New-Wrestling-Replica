import { useState } from "react";
import { X } from "lucide-react";
import { Technique, TechniqueGoal } from "@/context/DataContext";

interface LogRepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  technique: Technique;
  goal: TechniqueGoal;
  onSave: (technique: Technique) => void;
}

export function LogRepsModal({ isOpen, onClose, technique, goal, onSave }: LogRepsModalProps) {
  const [reps, setReps] = useState(10);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleLog = () => {
    if (reps <= 0) return;
    const log = { date: new Date().toISOString().slice(0, 10), reps, notes: notes.trim() || undefined };
    const updatedGoals = technique.goals.map((g) =>
      g.id === goal.id
        ? { ...g, completedReps: g.completedReps + reps, repLogs: [...g.repLogs, log] }
        : g
    );
    onSave({ ...technique, goals: updatedGoals });
    onClose();
  };

  const remaining = Math.max(0, goal.targetReps - goal.completedReps);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Log Reps</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 rounded-xl p-3 text-sm">
            <p className="font-medium text-blue-900">{technique.name}</p>
            <p className="text-blue-600">{remaining} reps remaining of {goal.targetReps}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Reps completed</label>
            <input type="number" value={reps} onChange={(e) => setReps(Number(e.target.value))} min={1} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Notes (optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="How did it feel?" />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLog} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">Log Reps</button>
        </div>
      </div>
    </div>
  );
}
