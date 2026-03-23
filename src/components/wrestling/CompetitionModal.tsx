import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useData, TrainingSession } from "@/context/DataContext";

interface CompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: TrainingSession;
}

export function CompetitionModal({ isOpen, onClose, sessionToEdit }: CompetitionModalProps) {
  const { addSession, updateSession } = useData();
  const isEditing = !!sessionToEdit;

  const [formData, setFormData] = useState<Partial<TrainingSession>>(
    sessionToEdit || { type: "Competition", date: new Date().toISOString().split("T")[0], duration: "", rating: 3, techniques: [], notes: "", name: "", weightClass: "", placement: "upcoming", matches: [], competitionWhatWentWell: "", competitionWhatDidntGoWell: "" }
  );

  const [matchInput, setMatchInput] = useState({ opponent: "", result: "win", method: "", time: "", score: "" });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session: TrainingSession = { id: isEditing ? sessionToEdit!.id : Date.now().toString(), type: "Competition", date: formData.date!, duration: formData.duration!, rating: formData.rating!, techniques: [], notes: formData.notes || "", name: formData.name, weightClass: formData.weightClass, placement: formData.placement, matches: formData.matches, competitionWhatWentWell: formData.competitionWhatWentWell, competitionWhatDidntGoWell: formData.competitionWhatDidntGoWell };
    if (isEditing) updateSession(sessionToEdit!.id, session); else addSession(session);
    onClose();
  };

  const addMatch = () => {
    if (matchInput.opponent && matchInput.method) {
      setFormData({ ...formData, matches: [...(formData.matches || []), { ...matchInput }] });
      setMatchInput({ opponent: "", result: "win", method: "", time: "", score: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit" : "Add"} Competition</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Competition Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., State Championship" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight Class</label><input type="text" value={formData.weightClass} onChange={(e) => setFormData({ ...formData, weightClass: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 152 lbs" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration</label><input type="text" placeholder="e.g., 3h" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
            <select value={formData.placement} onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="upcoming">Upcoming</option><option value="gold">🥇 Gold</option><option value="silver">🥈 Silver</option><option value="bronze">🥉 Bronze</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Rating: {formData.rating}/5</label><input type="range" min="1" max="5" step="0.5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} className="w-full" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matches</label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg mb-2">
              <input type="text" placeholder="Opponent name" value={matchInput.opponent} onChange={(e) => setMatchInput({ ...matchInput, opponent: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <div className="grid grid-cols-2 gap-2">
                <select value={matchInput.result} onChange={(e) => setMatchInput({ ...matchInput, result: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg"><option value="win">Win</option><option value="loss">Loss</option></select>
                <input type="text" placeholder="Method" value={matchInput.method} onChange={(e) => setMatchInput({ ...matchInput, method: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Time (optional)" value={matchInput.time} onChange={(e) => setMatchInput({ ...matchInput, time: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Score (optional)" value={matchInput.score} onChange={(e) => setMatchInput({ ...matchInput, score: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <button type="button" onClick={addMatch} className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Match</button>
            </div>
            <div className="space-y-1">
              {formData.matches?.map((match, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                  <span>{match.opponent}: <span className={match.result === "win" ? "text-green-600" : "text-red-600"}>{match.result}</span> by {match.method}</span>
                  <button type="button" onClick={() => setFormData({ ...formData, matches: formData.matches?.filter((_, idx) => idx !== i) })} className="text-red-500 hover:text-red-700"><Minus className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">What Went Well</label><textarea value={formData.competitionWhatWentWell || ""} onChange={(e) => setFormData({ ...formData, competitionWhatWentWell: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Positive highlights..." /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">What Didn't Go Well</label><textarea value={formData.competitionWhatDidntGoWell || ""} onChange={(e) => setFormData({ ...formData, competitionWhatDidntGoWell: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Areas to improve..." /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="Other notes..." /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">{isEditing ? "Save Changes" : "Add Competition"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
