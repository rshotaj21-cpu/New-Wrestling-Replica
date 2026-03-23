import { X, Trash2, Award } from "lucide-react";
import { useData } from "@/context/DataContext";

interface PRManagementModalProps { isOpen: boolean; onClose: () => void; }

export function PRManagementModal({ isOpen, onClose }: PRManagementModalProps) {
  const { personalRecords, deletePersonalRecord } = useData();
  if (!isOpen) return null;

  const sortedPRs = [...personalRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2"><Award className="w-6 h-6 text-green-700" /><h2 className="text-xl font-bold text-gray-900">Personal Records</h2></div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-4 space-y-4">
          {sortedPRs.length === 0 ? (
            <div className="text-center py-8 text-gray-500"><Award className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No personal records yet</p><p className="text-sm">Complete S&C sessions to set PRs</p></div>
          ) : (
            <div className="space-y-2">
              {sortedPRs.map((pr) => (
                <div key={`${pr.exerciseId}-${pr.sessionId}`} className="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1"><div className="font-semibold text-gray-900 mb-1">{pr.exerciseName}</div><div className="text-lg font-bold text-green-700">{pr.weight} × {pr.reps} reps</div><div className="text-xs text-gray-500 mt-1">{new Date(pr.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div></div>
                    <button onClick={() => { if (window.confirm(`Delete PR for ${pr.exerciseName}?`)) deletePersonalRecord(pr.exerciseId); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={onClose} className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}
