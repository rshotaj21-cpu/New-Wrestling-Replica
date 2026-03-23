import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useData, TrainingSession } from "@/context/DataContext";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "Training" | "Sparring" | "S&C" | "Competition";
  sessionToEdit?: TrainingSession;
}

export function SessionModal({ isOpen, onClose, type, sessionToEdit }: SessionModalProps) {
  const { addSession, updateSession } = useData();
  const isEditing = !!sessionToEdit;

  const [formData, setFormData] = useState<Partial<TrainingSession>>(
    sessionToEdit || {
      type,
      date: new Date().toISOString().split("T")[0],
      duration: "",
      rating: 3,
      techniques: [],
      notes: "",
      hasSparring: false,
    }
  );

  const [techniqueInput, setTechniqueInput] = useState("");
  const [exerciseInput, setExerciseInput] = useState({ name: "", sets: "", reps: "", weight: "" });
  const [techniqueUsageInput, setTechniqueUsageInput] = useState({ name: "", attempts: "" });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session: TrainingSession = {
      id: isEditing ? sessionToEdit!.id : Date.now().toString(),
      type: formData.type! as TrainingSession["type"],
      date: formData.date!,
      duration: formData.duration!,
      rating: formData.rating!,
      techniques: formData.techniques || [],
      notes: formData.notes || "",
      hasSparring: formData.hasSparring,
      rounds: formData.rounds,
      roundDuration: formData.roundDuration,
      endurance: formData.endurance,
      performance: formData.performance,
      techniqueUsage: formData.techniqueUsage,
      whatWentWell: formData.whatWentWell,
      whatDidntGoWell: formData.whatDidntGoWell,
      scType: formData.scType,
      focus: formData.focus,
      exercises: formData.exercises,
      conditioning: formData.conditioning,
      rpe: formData.rpe,
      name: formData.name,
      weightClass: formData.weightClass,
      placement: formData.placement,
      matches: formData.matches,
    };

    if (isEditing) {
      updateSession(sessionToEdit!.id, session);
    } else {
      addSession(session);
    }
    onClose();
  };

  const addTechnique = () => {
    if (techniqueInput.trim()) {
      setFormData({ ...formData, techniques: [...(formData.techniques || []), techniqueInput.trim()] });
      setTechniqueInput("");
    }
  };

  const removeTechnique = (index: number) => {
    setFormData({ ...formData, techniques: formData.techniques?.filter((_, i) => i !== index) });
  };

  const addExercise = () => {
    if (exerciseInput.name && exerciseInput.sets && exerciseInput.reps) {
      setFormData({
        ...formData,
        exercises: [...(formData.exercises || []), {
          name: exerciseInput.name, sets: parseInt(exerciseInput.sets),
          reps: parseInt(exerciseInput.reps), weight: exerciseInput.weight,
        }],
      });
      setExerciseInput({ name: "", sets: "", reps: "", weight: "" });
    }
  };

  const addTechniqueUsage = () => {
    if (techniqueUsageInput.name && techniqueUsageInput.attempts) {
      setFormData({
        ...formData,
        techniqueUsage: [...(formData.techniqueUsage || []), {
          name: techniqueUsageInput.name, attempts: parseInt(techniqueUsageInput.attempts),
        }],
      });
      setTechniqueUsageInput({ name: "", attempts: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit" : "Log"} {type} Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input type="text" placeholder="e.g., 2h 30m" value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating: {formData.rating}/5</label>
            <input type="range" min="1" max="5" step="0.5" value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} className="w-full" />
          </div>

          {/* Sparring Fields */}
          {type === "Sparring" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rounds</label>
                  <input type="number" value={formData.rounds || ""} onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Round Duration</label>
                  <input type="text" placeholder="e.g., 3 min" value={formData.roundDuration || ""}
                    onChange={(e) => setFormData({ ...formData, roundDuration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endurance: {formData.endurance || 50}%</label>
                <input type="range" min="0" max="100" value={formData.endurance || 50}
                  onChange={(e) => setFormData({ ...formData, endurance: parseInt(e.target.value) })} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Performance: {formData.performance || 50}%</label>
                <input type="range" min="0" max="100" value={formData.performance || 50}
                  onChange={(e) => setFormData({ ...formData, performance: parseInt(e.target.value) })} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technique Usage</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Technique name" value={techniqueUsageInput.name}
                    onChange={(e) => setTechniqueUsageInput({ ...techniqueUsageInput, name: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                  <input type="number" placeholder="Attempts" value={techniqueUsageInput.attempts}
                    onChange={(e) => setTechniqueUsageInput({ ...techniqueUsageInput, attempts: e.target.value })} className="w-24 px-3 py-2 border border-gray-300 rounded-lg" />
                  <button type="button" onClick={addTechniqueUsage} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.techniqueUsage?.map((tech, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                      <span>{tech.name}: {tech.attempts} attempts</span>
                      <button type="button" onClick={() => setFormData({ ...formData, techniqueUsage: formData.techniqueUsage?.filter((_, idx) => idx !== i) })}
                        className="text-red-500 hover:text-red-700"><Minus className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What Went Well</label>
                <textarea value={formData.whatWentWell || ""} onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Positive highlights..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What Didn't Go Well</label>
                <textarea value={formData.whatDidntGoWell || ""} onChange={(e) => setFormData({ ...formData, whatDidntGoWell: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Areas to improve..." />
              </div>
            </>
          )}

          {/* S&C Fields */}
          {type === "S&C" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formData.scType || "Strength"} onChange={(e) => setFormData({ ...formData, scType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="Strength">Strength</option>
                  <option value="Power">Power</option>
                  <option value="Conditioning">Conditioning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus</label>
                <input type="text" placeholder="e.g., Lower Body" value={formData.focus || ""}
                  onChange={(e) => setFormData({ ...formData, focus: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RPE: {formData.rpe || 5}/10</label>
                <input type="range" min="1" max="10" value={formData.rpe || 5}
                  onChange={(e) => setFormData({ ...formData, rpe: parseInt(e.target.value) })} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercises</label>
                <div className="space-y-2 mb-2">
                  <input type="text" placeholder="Exercise name" value={exerciseInput.name}
                    onChange={(e) => setExerciseInput({ ...exerciseInput, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="Sets" value={exerciseInput.sets}
                      onChange={(e) => setExerciseInput({ ...exerciseInput, sets: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    <input type="number" placeholder="Reps" value={exerciseInput.reps}
                      onChange={(e) => setExerciseInput({ ...exerciseInput, reps: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    <input type="text" placeholder="Weight" value={exerciseInput.weight}
                      onChange={(e) => setExerciseInput({ ...exerciseInput, weight: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <button type="button" onClick={addExercise}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Exercise
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.exercises?.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                      <span>{ex.name}: {ex.sets}×{ex.reps} @ {ex.weight}</span>
                      <button type="button" onClick={() => setFormData({ ...formData, exercises: formData.exercises?.filter((_, idx) => idx !== i) })}
                        className="text-red-500 hover:text-red-700"><Minus className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Training/Competition techniques */}
          {(type === "Training" || type === "Competition") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Techniques Practiced</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Add technique..." value={techniqueInput}
                    onChange={(e) => setTechniqueInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTechnique())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                  <button type="button" onClick={addTechnique} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.techniques?.map((tech, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm">
                      <span>{tech}</span>
                      <button type="button" onClick={() => removeTechnique(i)} className="text-gray-500 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sparring Option for Training */}
              {type === "Training" && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="hasSparring" checked={formData.hasSparring || false}
                      onChange={(e) => setFormData({ ...formData, hasSparring: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                    <label htmlFor="hasSparring" className="text-sm font-medium text-gray-700">Include Sparring Data</label>
                  </div>
                  {formData.hasSparring && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rounds</label>
                          <input type="number" value={formData.rounds || ""} onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Round Duration</label>
                          <input type="text" placeholder="e.g., 3 min" value={formData.roundDuration || ""}
                            onChange={(e) => setFormData({ ...formData, roundDuration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Endurance: {formData.endurance || 50}%</label>
                        <input type="range" min="0" max="100" value={formData.endurance || 50}
                          onChange={(e) => setFormData({ ...formData, endurance: parseInt(e.target.value) })} className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Performance: {formData.performance || 50}%</label>
                        <input type="range" min="0" max="100" value={formData.performance || 50}
                          onChange={(e) => setFormData({ ...formData, performance: parseInt(e.target.value) })} className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Technique Usage</label>
                        <div className="flex gap-2 mb-2">
                          <input type="text" placeholder="Technique name" value={techniqueUsageInput.name}
                            onChange={(e) => setTechniqueUsageInput({ ...techniqueUsageInput, name: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                          <input type="number" placeholder="Attempts" value={techniqueUsageInput.attempts}
                            onChange={(e) => setTechniqueUsageInput({ ...techniqueUsageInput, attempts: e.target.value })} className="w-24 px-3 py-2 border border-gray-300 rounded-lg" />
                          <button type="button" onClick={addTechniqueUsage} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {formData.techniqueUsage?.map((tech, i) => (
                            <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg text-sm">
                              <span>{tech.name}: {tech.attempts} attempts</span>
                              <button type="button" onClick={() => setFormData({ ...formData, techniqueUsage: formData.techniqueUsage?.filter((_, idx) => idx !== i) })}
                                className="text-red-500 hover:text-red-700"><Minus className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">What Went Well</label>
                        <textarea value={formData.whatWentWell || ""} onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Positive highlights..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">What Didn't Go Well</label>
                        <textarea value={formData.whatDidntGoWell || ""} onChange={(e) => setFormData({ ...formData, whatDidntGoWell: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Areas to improve..." />
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="Additional notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium">{isEditing ? "Save Changes" : "Log Session"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
