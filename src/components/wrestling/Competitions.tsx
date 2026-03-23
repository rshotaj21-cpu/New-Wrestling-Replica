import { motion } from "framer-motion";
import { Trophy, Calendar, Plus } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { CompetitionModal } from "./CompetitionModal";
import { SessionDetailModal } from "./SessionDetailModal";

const placementColors: Record<string, string> = { gold: "from-yellow-500 to-yellow-600", silver: "from-gray-400 to-gray-500", bronze: "from-orange-500 to-orange-600", upcoming: "from-blue-600 to-blue-700" };
const placementIcons: Record<string, string> = { gold: "🥇", silver: "🥈", bronze: "🥉", upcoming: "📅" };

export function Competitions() {
  const { sessions } = useData();
  const [showCompModal, setShowCompModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const competitions = sessions.filter(s => s.type === "Competition");

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Competitions</h1><p className="text-sm text-gray-500">Your competitive journey</p></div>
      <button onClick={() => setShowCompModal(true)} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2 active:scale-[0.97]"><Plus className="w-6 h-6" /><span className="font-semibold">Add Competition</span></button>
      <div className="space-y-4">
        {competitions.length === 0 ? (<div className="text-center py-8 text-gray-500"><Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No competitions logged yet</p></div>) : (
          competitions.map((comp, index) => (
            <motion.div key={comp.id} className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} onClick={() => setSelectedSession(comp.id)}>
              <div className={`bg-gradient-to-r ${placementColors[comp.placement as string] || placementColors.upcoming} p-4 text-white`}>
                <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Trophy className="w-5 h-5" /><h3 className="font-semibold">{comp.name}</h3></div><span className="text-2xl">{placementIcons[comp.placement as string]}</span></div>
                <div className="flex items-center gap-3 text-sm opacity-90"><span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(comp.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>{comp.weightClass && <span>⚖️ {comp.weightClass}</span>}</div>
              </div>
              {comp.matches && comp.matches.length > 0 && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3"><span className="text-sm font-semibold text-gray-700">Record</span><span className="font-bold text-gray-900">{comp.matches.filter(m => m.result === "win").length}W - {comp.matches.filter(m => m.result === "loss").length}L</span></div>
                  <div className="space-y-2">{comp.matches.map((match, i) => (<div key={i} className={`rounded-lg p-3 border-l-4 ${match.result === "win" ? "bg-green-50 border-green-600" : "bg-red-50 border-red-600"}`}><div className="flex items-center justify-between mb-1"><span className="font-medium text-gray-900">vs {match.opponent}</span><span className={`text-xs font-semibold px-2 py-1 rounded ${match.result === "win" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{match.result.charAt(0).toUpperCase() + match.result.slice(1)}</span></div><div className="text-sm text-gray-600">{match.method}{match.time && ` • ${match.time}`}</div></div>))}</div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
      <CompetitionModal isOpen={showCompModal} onClose={() => setShowCompModal(false)} />
      {selectedSession && <SessionDetailModal session={sessions.find(s => s.id === selectedSession)!} isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  );
}
