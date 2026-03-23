import { useState } from "react";
import { X } from "lucide-react";
import { useData, TrainingSession } from "@/context/DataContext";

interface OneOnOneModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: TrainingSession;
}

export function OneOnOneModal({ isOpen, onClose, sessionToEdit }: OneOnOneModalProps) {
  const { addSession, updateSession } = useData();
  const isEditing = !!sessionToEdit;
  const [formData, setFormData] = useState<Partial<TrainingSession>>(
    sessionToEdit || { type: "1-2-1", date: new Date().toISOString().split("T")[0], duration: "", rating: 3, techniques: [], notes: "", coachName: "", drillsToWork: "", lessonsLearned: "" }
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session: TrainingSession = { id: isEditing ? sessionToEdit!.id : Date.now().toString(), type: "1-2-1", date: formData.date!, duration: formData.duration!, rating: formData.rating!, techniques: [], notes: formData.notes || "", coachName: formData.coachName, drillsToWork: formData.drillsToWork, lessonsLearned: formData.lessonsLearned };
    if (isEditing) updateSession(sessionToEdit!.id, session); else addSession(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit" : "Log"} 1-2-1 Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Coach Name</label><input type="text" value={formData.coachName} onChange={(e) => setFormData({ ...formData, coachName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Coach Ramirez" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration</label><input type="text" placeholder="e.g., 1h 30m" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Rating: {formData.rating}/5</label><input type="range" min="1" max="5" step="0.5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} className="w-full" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">What I Learned</label><textarea value={formData.lessonsLearned || ""} onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="Key takeaways..." required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Drills to Work On</label><textarea value={formData.drillsToWork || ""} onChange={(e) => setFormData({ ...formData, drillsToWork: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="Drills and exercises..." /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Other observations..." /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">{isEditing ? "Save Changes" : "Log Session"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
