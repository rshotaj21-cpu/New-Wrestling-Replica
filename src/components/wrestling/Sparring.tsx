import { useState } from "react";
import { motion } from "framer-motion";
import { Timer, Activity, Target, Plus } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { useData } from "@/context/DataContext";
import { SessionModal } from "./SessionModal";
import { SessionDetailModal } from "./SessionDetailModal";

export function Sparring() {
  const { sessions } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const sparringSessions = sessions.filter((s) => s.type === "Sparring");
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      <div className="p-4 max-w-md mx-auto space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Sparring Analytics</h1><p className="text-sm text-gray-500">Live training performance</p></div>
          <button onClick={() => setIsAddModalOpen(true)} className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm"><Plus className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          {sparringSessions.length === 0 ? (
            <div className="text-center py-12"><div className="text-4xl mb-3">🥊</div><p className="text-gray-500 mb-4">No sparring sessions yet</p><button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">Log Your First Sparring Session</button></div>
          ) : (
            sparringSessions.map((session, index) => (
              <motion.div key={session.id} className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} onClick={() => setSelectedSessionId(session.id)}>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                  <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Sparring Session</h3><Activity className="w-5 h-5" /></div>
                  <p className="text-sm opacity-90">{formatDate(session.date)}</p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex gap-4">
                    {session.rounds && <div className="flex-1 bg-gray-50 rounded-lg p-3"><div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Timer className="w-4 h-4" /><span>Rounds</span></div><div className="text-2xl font-bold text-gray-900">{session.rounds}</div></div>}
                    {session.roundDuration && <div className="flex-1 bg-gray-50 rounded-lg p-3"><div className="flex items-center gap-2 text-gray-500 text-xs mb-1"><Timer className="w-4 h-4" /><span>Duration</span></div><div className="text-2xl font-bold text-gray-900">{session.roundDuration}</div></div>}
                  </div>
                  {(session.endurance !== undefined || session.performance !== undefined) && (
                    <div className="space-y-3">
                      {session.endurance !== undefined && <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Endurance</span><span className="font-semibold text-gray-900">{session.endurance}%</span></div><ProgressBar value={session.endurance} className="bg-gray-100" barClassName="bg-gradient-to-r from-green-400 to-green-500" /></div>}
                      {session.performance !== undefined && <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Performance</span><span className="font-semibold text-gray-900">{session.performance}%</span></div><ProgressBar value={session.performance} className="bg-gray-100" barClassName="bg-gradient-to-r from-blue-400 to-blue-500" /></div>}
                    </div>
                  )}
                  {session.techniqueUsage && session.techniqueUsage.length > 0 && (
                    <div><div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Target className="w-4 h-4" /><span>Technique Usage</span></div>
                      <div className="space-y-2">{session.techniqueUsage.slice(0, 3).map((tech, i) => (<div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2"><span className="text-gray-700">{tech.name}</span><span className="font-semibold text-green-600">{tech.attempts} attempts</span></div>))}</div></div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <SessionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} type="Sparring" />
      {selectedSession && <SessionDetailModal isOpen={!!selectedSessionId} onClose={() => setSelectedSessionId(null)} session={selectedSession} />}
    </>
  );
}
