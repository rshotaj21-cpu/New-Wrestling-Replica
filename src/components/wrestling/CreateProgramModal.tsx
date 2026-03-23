import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useData, SCProgram, ProgramWeek } from "@/context/DataContext";

interface CreateProgramModalProps { isOpen: boolean; onClose: () => void; }

export function CreateProgramModal({ isOpen, onClose }: CreateProgramModalProps) {
  const { addProgram, exercises } = useData();
  const [programName, setProgramName] = useState("");
  const [duration, setDuration] = useState(4);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weeks, setWeeks] = useState<ProgramWeek[]>([]);
  const [sessionForm, setSessionForm] = useState({ day: "Monday", type: "Strength" as "Strength" | "Power" | "Conditioning", focus: "", exercises: [] as Array<{ exerciseId: string; exerciseName: string; sets: number; reps: number; weight: string; notes?: string }> });
  const [exerciseInput, setExerciseInput] = useState({ exerciseId: "", sets: "", reps: "", weight: "", notes: "" });

  if (!isOpen) return null;

  const handleAddExerciseToSession = () => {
    if (exerciseInput.exerciseId && exerciseInput.sets && exerciseInput.reps) {
      const exercise = exercises.find((e) => e.id === exerciseInput.exerciseId);
      if (exercise) {
        setSessionForm({ ...sessionForm, exercises: [...sessionForm.exercises, { exerciseId: exercise.id, exerciseName: exercise.name, sets: parseInt(exerciseInput.sets), reps: parseInt(exerciseInput.reps), weight: exerciseInput.weight, notes: exerciseInput.notes }] });
        setExerciseInput({ exerciseId: "", sets: "", reps: "", weight: "", notes: "" });
      }
    }
  };

  const handleAddSessionToWeek = () => {
    if (sessionForm.focus && sessionForm.exercises.length > 0) {
      const weekIndex = weeks.findIndex((w) => w.weekNumber === currentWeek);
      if (weekIndex !== -1) { const u = [...weeks]; u[weekIndex].sessions.push({ ...sessionForm }); setWeeks(u); }
      else setWeeks([...weeks, { weekNumber: currentWeek, sessions: [{ ...sessionForm }] }]);
      setSessionForm({ day: "Monday", type: "Strength", focus: "", exercises: [] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProgram({ id: `program-${Date.now()}`, name: programName, duration, weeks, isActive: false, createdDate: new Date().toISOString().split("T")[0] });
    setProgramName(""); setDuration(4); setCurrentWeek(1); setWeeks([]);
    onClose();
  };

  const currentWeekData = weeks.find((w) => w.weekNumber === currentWeek);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Create Training Program</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label><input type="text" value={programName} onChange={(e) => setProgramName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Strength Building Phase" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label><input type="number" min="1" max="52" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Configure Week {currentWeek} of {duration}</label>
            <div className="flex gap-2 mb-4">
              <button type="button" onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))} disabled={currentWeek === 1} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">Previous</button>
              <button type="button" onClick={() => setCurrentWeek(Math.min(duration, currentWeek + 1))} disabled={currentWeek === duration} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">Next</button>
            </div>
            {currentWeekData && currentWeekData.sessions.length > 0 && (
              <div className="mb-4 space-y-2">
                <div className="text-sm font-medium text-gray-700">Sessions for Week {currentWeek}:</div>
                {currentWeekData.sessions.map((session, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="flex items-center justify-between mb-1"><span className="font-semibold">{session.day} - {session.type}</span>
                      <button type="button" onClick={() => setWeeks(weeks.map((w) => w.weekNumber === currentWeek ? { ...w, sessions: w.sessions.filter((_, i) => i !== idx) } : w))} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
                    <div className="text-xs text-gray-600">{session.focus} • {session.exercises.length} exercises</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t pt-4 space-y-4">
            <div className="text-sm font-semibold text-gray-700">Add Session to Week {currentWeek}</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Day</label><select value={sessionForm.day} onChange={(e) => setSessionForm({ ...sessionForm, day: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label><select value={sessionForm.type} onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="Strength">Strength</option><option value="Power">Power</option><option value="Conditioning">Conditioning</option></select></div>
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Focus</label><input type="text" value={sessionForm.focus} onChange={(e) => setSessionForm({ ...sessionForm, focus: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., Lower Body" /></div>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-gray-700">Add Exercises</div>
              <select value={exerciseInput.exerciseId} onChange={(e) => setExerciseInput({ ...exerciseInput, exerciseId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Select Exercise</option>{exercises.map((ex) => (<option key={ex.id} value={ex.id}>{ex.name} ({ex.category})</option>))}</select>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Sets" value={exerciseInput.sets} onChange={(e) => setExerciseInput({ ...exerciseInput, sets: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="number" placeholder="Reps" value={exerciseInput.reps} onChange={(e) => setExerciseInput({ ...exerciseInput, reps: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="text" placeholder="Weight" value={exerciseInput.weight} onChange={(e) => setExerciseInput({ ...exerciseInput, weight: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <button type="button" onClick={handleAddExerciseToSession} className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Exercise</button>
              {sessionForm.exercises.length > 0 && <div className="space-y-1 mt-3">{sessionForm.exercises.map((ex, idx) => (<div key={idx} className="flex items-center justify-between bg-white p-2 rounded text-xs"><span>{ex.exerciseName}: {ex.sets}×{ex.reps} @ {ex.weight}</span><button type="button" onClick={() => setSessionForm({ ...sessionForm, exercises: sessionForm.exercises.filter((_, i) => i !== idx) })} className="text-red-500"><Trash2 className="w-3 h-3" /></button></div>))}</div>}
            </div>
            <button type="button" onClick={handleAddSessionToWeek} disabled={!sessionForm.focus || sessionForm.exercises.length === 0} className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium">Add Session to Week {currentWeek}</button>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={!programName || weeks.length === 0} className="flex-1 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium disabled:opacity-50">Create Program</button>
          </div>
        </form>
      </div>
    </div>
  );
}
