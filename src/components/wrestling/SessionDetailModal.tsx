import { useState } from "react";
import { X, Edit, Trash2, Clock, Star, Target, Activity, Dumbbell, Trophy, UserCheck } from "lucide-react";
import { useData, TrainingSession } from "@/context/DataContext";
import { SessionModal } from "./SessionModal";
import { CompetitionModal } from "./CompetitionModal";
import { OneOnOneModal } from "./OneOnOneModal";
import { ProgressBar } from "./ProgressBar";

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TrainingSession;
}

export function SessionDetailModal({ isOpen, onClose, session }: SessionDetailModalProps) {
  const { deleteSession } = useData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const handleDelete = () => { deleteSession(session.id); onClose(); };

  const colorMap: Record<string, string> = {
    Training: "from-blue-600 to-blue-700", "S&C": "from-orange-600 to-orange-700",
    Competition: "from-red-600 to-red-700", "1-2-1": "from-purple-600 to-purple-700", Sparring: "from-green-600 to-green-700",
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className={`bg-gradient-to-r ${colorMap[session.type] || colorMap.Training} p-6 text-white rounded-t-2xl`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{session.type} Session</h2>
                <p className="text-sm opacity-90">{formatDate(session.date)}</p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{session.duration}</span></div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(session.rating) ? "fill-white text-white" : i < session.rating ? "fill-white/50 text-white" : "text-white/30"}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* S&C Details */}
            {session.type === "S&C" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {session.scType && <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Type</div><div className="font-semibold text-gray-900">{session.scType}</div></div>}
                  {session.focus && <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Focus</div><div className="font-semibold text-gray-900">{session.focus}</div></div>}
                </div>
                {session.rpe && <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">RPE</span><span className="font-semibold text-gray-900">{session.rpe}/10</span></div><ProgressBar value={session.rpe * 10} className="bg-gray-100" barClassName="bg-gradient-to-r from-orange-400 to-orange-500" /></div>}
                {session.exercises && session.exercises.length > 0 && (
                  <div><div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Dumbbell className="w-4 h-4" /><span>Exercises</span></div>
                    <div className="space-y-2">{session.exercises.map((ex, i) => (<div key={i} className="bg-gray-50 rounded-lg p-3"><div className="font-medium text-gray-900 mb-1">{ex.name}</div><div className="text-sm text-gray-600">{ex.sets} sets × {ex.reps} reps @ {ex.weight}</div></div>))}</div></div>
                )}
              </>
            )}

            {/* Sparring Details */}
            {(session.type === "Sparring" || (session.type === "Training" && session.hasSparring)) && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {session.rounds && <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Rounds</div><div className="text-2xl font-bold text-gray-900">{session.rounds}</div></div>}
                  {session.roundDuration && <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Duration</div><div className="text-2xl font-bold text-gray-900">{session.roundDuration}</div></div>}
                </div>
                {(session.endurance !== undefined || session.performance !== undefined) && (
                  <div className="space-y-3">
                    {session.endurance !== undefined && <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Endurance</span><span className="font-semibold text-gray-900">{session.endurance}%</span></div><ProgressBar value={session.endurance} className="bg-gray-100" barClassName="bg-gradient-to-r from-green-400 to-green-500" /></div>}
                    {session.performance !== undefined && <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Performance</span><span className="font-semibold text-gray-900">{session.performance}%</span></div><ProgressBar value={session.performance} className="bg-gray-100" barClassName="bg-gradient-to-r from-blue-400 to-blue-500" /></div>}
                  </div>
                )}
                {session.whatWentWell && <div><div className="text-sm font-semibold text-gray-700 mb-2">✅ What Went Well</div><div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-gray-700">{session.whatWentWell}</div></div>}
                {session.whatDidntGoWell && <div><div className="text-sm font-semibold text-gray-700 mb-2">🎯 Areas to Improve</div><div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-gray-700">{session.whatDidntGoWell}</div></div>}
              </>
            )}

            {/* 1-2-1 Details */}
            {session.type === "1-2-1" && (
              <>
                {session.coachName && <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Coach</div><div className="font-semibold text-gray-900">{session.coachName}</div></div>}
                {session.lessonsLearned && <div><div className="text-sm font-semibold text-gray-700 mb-2">📚 What I Learned</div><div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-gray-700">{session.lessonsLearned}</div></div>}
                {session.drillsToWork && <div><div className="text-sm font-semibold text-gray-700 mb-2">Drills to Work On</div><div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{session.drillsToWork}</div></div>}
              </>
            )}

            {/* Competition Details */}
            {session.type === "Competition" && session.matches && session.matches.length > 0 && (
              <div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-3">
                  <span className="text-sm font-semibold text-gray-700">Record</span>
                  <span className="font-bold text-gray-900">{session.matches.filter(m => m.result === "win").length}W - {session.matches.filter(m => m.result === "loss").length}L</span>
                </div>
                <div className="space-y-2">
                  {session.matches.map((match, i) => (
                    <div key={i} className={`rounded-lg p-3 border-l-4 ${match.result === "win" ? "bg-green-50 border-green-600" : "bg-red-50 border-red-600"}`}>
                      <div className="flex items-center justify-between mb-1"><span className="font-medium text-gray-900">vs {match.opponent}</span><span className={`text-xs font-semibold px-2 py-1 rounded ${match.result === "win" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{match.result.charAt(0).toUpperCase() + match.result.slice(1)}</span></div>
                      <div className="text-sm text-gray-600">{match.method}{match.time && ` • ${match.time}`}{match.score && ` • ${match.score}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {session.techniques && session.techniques.length > 0 && (
              <div><div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Target className="w-4 h-4" /><span>Techniques Practiced</span></div>
                <div className="flex flex-wrap gap-2">{session.techniques.map((tech, i) => (<span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm">{tech}</span>))}</div></div>
            )}

            {session.notes && <div><div className="text-sm font-semibold text-gray-700 mb-2">Notes</div><div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{session.notes}</div></div>}
          </div>

          <div className="border-t border-gray-200 p-4 flex gap-3">
            {showDeleteConfirm ? (
              <><button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium">Confirm Delete</button></>
            ) : (
              <><button onClick={() => setShowDeleteConfirm(true)} className="p-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"><Trash2 className="w-5 h-5" /></button>
              <button onClick={() => setIsEditModalOpen(true)} className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"><Edit className="w-4 h-4" /> Edit Session</button></>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (session.type === "Training" || session.type === "S&C" || session.type === "Sparring") && (
        <SessionModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); onClose(); }} type={session.type as any} sessionToEdit={session} />
      )}
      {isEditModalOpen && session.type === "Competition" && (
        <CompetitionModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); onClose(); }} sessionToEdit={session} />
      )}
      {isEditModalOpen && session.type === "1-2-1" && (
        <OneOnOneModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); onClose(); }} sessionToEdit={session} />
      )}
    </>
  );
}
