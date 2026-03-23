import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Star, StickyNote, ChevronRight, Plus } from "lucide-react";
import { useData } from "@/context/DataContext";
import { SessionModal } from "./SessionModal";
import { SessionDetailModal } from "./SessionDetailModal";

const colorMap: Record<string, string> = {
  Training: "from-blue-500 to-blue-600", Sparring: "from-green-500 to-green-600",
  "S&C": "from-orange-500 to-orange-600", Competition: "from-red-500 to-red-600", "1-2-1": "from-purple-500 to-purple-600",
};

export function Sessions() {
  const { sessions } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const selectedSessionData = sessions.find((s) => s.id === selectedSession);

  return (
    <>
      <div className="p-4 max-w-md mx-auto space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Training Sessions</h1><p className="text-sm text-gray-500">Your complete training history</p></div>
          <button onClick={() => setIsAddModalOpen(true)} className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm"><Plus className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12"><div className="text-4xl mb-3">🤼</div><p className="text-gray-500 mb-4">No sessions yet</p><button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">Log Your First Session</button></div>
          ) : (
            sessions.map((session, index) => (
              <motion.div key={session.id} className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} onClick={() => setSelectedSession(session.id)}>
                <div className={`h-1 bg-gradient-to-r ${colorMap[session.type] || colorMap.Training}`} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3"><div><h3 className="font-semibold text-gray-900">{session.type}</h3><p className="text-xs text-gray-500">{formatDate(session.date)}</p></div><ChevronRight className="w-5 h-5 text-gray-400" /></div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600"><Clock className="w-4 h-4" /><span>{session.duration}</span></div>
                    <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < Math.floor(session.rating) ? "fill-yellow-400 text-yellow-400" : i < session.rating ? "fill-yellow-400/50 text-yellow-400" : "text-gray-300"}`} />))}</div>
                  </div>
                  {(session.techniques.length > 0 || session.notes) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {session.techniques.slice(0, 3).map((tech, i) => (<span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{tech}</span>))}
                      {session.techniques.length > 3 && <span className="text-xs text-gray-500">+{session.techniques.length - 3} more</span>}
                      {session.notes && <div className="flex items-center gap-1 text-xs text-gray-500"><StickyNote className="w-3 h-3" /><span>Notes</span></div>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <SessionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} type="Training" />
      {selectedSessionData && <SessionDetailModal isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} session={selectedSessionData} />}
    </>
  );
}
