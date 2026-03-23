import { useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { useData, Exercise } from "@/context/DataContext";

interface ManageExercisesModalProps { isOpen: boolean; onClose: () => void; }

export function ManageExercisesModal({ isOpen, onClose }: ManageExercisesModalProps) {
  const { exercises, deleteExercise, addExercise } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [newExercise, setNewExercise] = useState({ name: "", category: "Upper Body" as Exercise["category"] });
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const categories = ["All", "Upper Body", "Lower Body", "Core", "Cardio", "Olympic Lifts", "Accessories"];
  const filteredExercises = selectedCategory === "All" ? exercises : exercises.filter(ex => ex.category === selectedCategory);

  const handleAddExercise = () => {
    if (newExercise.name.trim()) {
      addExercise({ id: `custom-${Date.now()}`, name: newExercise.name.trim(), category: newExercise.category, isCustom: true });
      setNewExercise({ name: "", category: "Upper Body" }); setShowAddForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Manage Exercises</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-4 space-y-4">
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Add New Exercise</button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <input type="text" value={newExercise.name} onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })} placeholder="Exercise name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <select value={newExercise.category} onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value as Exercise["category"] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddExercise} disabled={!newExercise.name.trim()} className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">Add</button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">{filteredExercises.length} Exercise{filteredExercises.length !== 1 ? "s" : ""}</div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredExercises.map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div><div className="font-medium text-gray-900">{exercise.name}</div><div className="text-xs text-gray-500">{exercise.category}{exercise.isCustom && <span className="ml-2 text-orange-600 font-medium">(Custom)</span>}</div></div>
                  {exercise.isCustom && <button onClick={() => { if (window.confirm(`Delete "${exercise.name}"?`)) deleteExercise(exercise.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}
