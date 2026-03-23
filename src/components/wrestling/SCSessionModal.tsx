import { useState } from "react";
import { X, Plus, Minus, TrendingUp, Award } from "lucide-react";
import { useData, TrainingSession, PersonalRecord } from "@/context/DataContext";

interface SCSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: TrainingSession;
  prefill?: Partial<TrainingSession>;
}

export function SCSessionModal({ isOpen, onClose, sessionToEdit, prefill }: SCSessionModalProps) {
  const { addSession, updateSession, exercises, programs, getPersonalRecord, updatePersonalRecord } = useData();
  const isEditing = !!sessionToEdit;

  const initialData = sessionToEdit || prefill || {
    type: "S&C" as const,
    date: new Date().toISOString().split("T")[0],
    duration: "",
    rating: 3,
    techniques: [],
    notes: "",
    scType: "Strength" as const,
    focus: "",
    exercises: [],
    rpe: 5,
  };

  const [formData, setFormData] = useState<Partial<TrainingSession>>(initialData);
  const [exerciseInput, setExerciseInput] = useState({ exerciseId: "", sets: "", reps: "", weight: "" });
  const [prInfo, setPrInfo] = useState<{ exerciseId: string; currentPR?: PersonalRecord; newIsPR: boolean } | null>(null);
  const [prsAchieved, setPrsAchieved] = useState<string[]>([]);

  if (!isOpen) return null;

  const checkIfPR = (exerciseId: string, weight: string, reps: number) => {
    const currentPR = getPersonalRecord(exerciseId);
    if (!currentPR) return true;
    const parseWeight = (w: string) => { const m = w.match(/(\d+\.?\d*)/); return m ? parseFloat(m[1]) : 0; };
    const nw = parseWeight(weight), pw = parseWeight(currentPR.weight);
    return nw > pw || (nw === pw && reps > currentPR.reps);
  };

  const handleWeightChange = (weight: string) => {
    setExerciseInput({ ...exerciseInput, weight });
    if (exerciseInput.exerciseId && exerciseInput.reps && weight) {
      setPrInfo({ exerciseId: exerciseInput.exerciseId, currentPR: getPersonalRecord(exerciseInput.exerciseId), newIsPR: checkIfPR(exerciseInput.exerciseId, weight, parseInt(exerciseInput.reps)) });
    } else setPrInfo(null);
  };

  const handleRepsChange = (reps: string) => {
    setExerciseInput({ ...exerciseInput, reps });
    if (exerciseInput.exerciseId && reps && exerciseInput.weight) {
      setPrInfo({ exerciseId: exerciseInput.exerciseId, currentPR: getPersonalRecord(exerciseInput.exerciseId), newIsPR: checkIfPR(exerciseInput.exerciseId, exerciseInput.weight, parseInt(reps)) });
    } else setPrInfo(null);
  };

  const addExercise = () => {
    if (exerciseInput.exerciseId && exerciseInput.sets && exerciseInput.reps && exerciseInput.weight) {
      const exercise = exercises.find((e) => e.id === exerciseInput.exerciseId);
      if (exercise) {
        setFormData({ ...formData, exercises: [...(formData.exercises || []), { name: exercise.name, sets: parseInt(exerciseInput.sets), reps: parseInt(exerciseInput.reps), weight: exerciseInput.weight, exerciseId: exercise.id }] });
        if (prInfo?.newIsPR) setPrsAchieved([...prsAchieved, exercise.name]);
        setExerciseInput({ exerciseId: "", sets: "", reps: "", weight: "" }); setPrInfo(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionId = isEditing ? sessionToEdit!.id : Date.now().toString();
    const session: TrainingSession = {
      id: sessionId,
      type: "S&C",
      date: formData.date!,
      duration: formData.duration!,
      rating: formData.rating!,
      techniques: [],
      notes: formData.notes || "",
      scType: formData.scType,
      focus: formData.focus,
      exercises: formData.exercises,
      rpe: formData.rpe,
      programId: formData.programId,
      weekNumber: formData.weekNumber,
    };
    formData.exercises?.forEach((ex) => {
      if (ex.exerciseId && checkIfPR(ex.exerciseId, ex.weight, ex.reps)) {
        updatePersonalRecord({ exerciseId: ex.exerciseId, exerciseName: ex.name, weight: ex.weight, reps: ex.reps, date: formData.date!, sessionId });
      }
    });
    if (isEditing) updateSession(sessionToEdit!.id, session); else addSession(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit" : "Log"} S&C Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Program link indicator */}
          {formData.programId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              📋 Linked to: <span className="font-medium">{programs.find(p => p.id === formData.programId)?.name}</span>
              {formData.weekNumber && <span> — Week {formData.weekNumber}</span>}
            </div>
          )}

          {/* Link to program selector (only when not already linked) */}
          {!formData.programId && programs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to Program (optional)</label>
              <select
                value={formData.programId || ""}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">No program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration</label><input type="text" placeholder="e.g., 1h 15m" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Rating: {formData.rating}/5</label><input type="range" min="1" max="5" step="0.5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} className="w-full" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={formData.scType || "Strength"} onChange={(e) => setFormData({ ...formData, scType: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="Strength">Strength</option><option value="Power">Power</option><option value="Conditioning">Conditioning</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Focus</label><input type="text" placeholder="e.g., Lower Body" value={formData.focus || ""} onChange={(e) => setFormData({ ...formData, focus: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">RPE: {formData.rpe || 5}/10</label><input type="range" min="1" max="10" value={formData.rpe || 5} onChange={(e) => setFormData({ ...formData, rpe: parseInt(e.target.value) })} className="w-full" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exercises</label>
            <div className="space-y-2 mb-2 bg-gray-50 p-3 rounded-lg">
              <select value={exerciseInput.exerciseId} onChange={(e) => { setExerciseInput({ ...exerciseInput, exerciseId: e.target.value }); setPrInfo(null); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select Exercise</option>{exercises.map((ex) => (<option key={ex.id} value={ex.id}>{ex.name} ({ex.category})</option>))}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Sets" value={exerciseInput.sets} onChange={(e) => setExerciseInput({ ...exerciseInput, sets: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="Reps" value={exerciseInput.reps} onChange={(e) => handleRepsChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Weight" value={exerciseInput.weight} onChange={(e) => handleWeightChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              {prInfo && (
                <div className={`p-2 rounded-lg text-sm ${prInfo.newIsPR ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                  {prInfo.newIsPR ? <div className="flex items-center gap-2 text-green-700"><Award className="w-4 h-4" /><span className="font-semibold">NEW PR! 🎉</span></div>
                    : prInfo.currentPR && <div className="flex items-center gap-2 text-blue-700"><TrendingUp className="w-4 h-4" /><span>Current PR: {prInfo.currentPR.weight} × {prInfo.currentPR.reps}</span></div>}
                </div>
              )}
              <button type="button" onClick={addExercise} className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Exercise</button>
            </div>
            <div className="space-y-1">
              {formData.exercises?.map((ex, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                  <span>{ex.name}: {ex.sets}×{ex.reps} @ {ex.weight}{prsAchieved.includes(ex.name) && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">PR!</span>}</span>
                  <button type="button" onClick={() => setFormData({ ...formData, exercises: formData.exercises?.filter((_, idx) => idx !== i) })} className="text-red-500 hover:text-red-700"><Minus className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="Additional notes..." /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">{isEditing ? "Save Changes" : "Log Session"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
