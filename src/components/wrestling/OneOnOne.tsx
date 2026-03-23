import { motion } from "framer-motion";
import { UserCheck, Plus, Calendar, Clock, BookOpen } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { OneOnOneModal } from "./OneOnOneModal";
import { SessionDetailModal } from "./SessionDetailModal";

export function OneOnOne() {
  const { sessions } = useData();
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const oneOnOneSessions = sessions.filter(s => s.type === "1-2-1");

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">1-2-1 Coaching</h1><p className="text-sm text-gray-500">Private training sessions</p></div>
      <button onClick={() => setShowModal(true)} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2 active:scale-[0.97]"><Plus className="w-6 h-6" /><span className="font-semibold">Log 1-2-1 Session</span></button>
      <div className="space-y-4">
        {oneOnOneSessions.length === 0 ? (<div className="text-center py-8 text-gray-500"><UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No 1-2-1 sessions logged yet</p></div>) : (
          oneOnOneSessions.map((session, index) => (
            <motion.div key={session.id} className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} onClick={() => setSelectedSession(session.id)}>
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
                <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><UserCheck className="w-5 h-5" /><h3 className="font-semibold">{session.coachName || "1-2-1 Session"}</h3></div><div className="flex items-center gap-1">{"⭐".repeat(Math.floor(session.rating))}</div></div>
                <div className="flex items-center gap-3 text-sm opacity-90"><span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span><span className="flex items-center gap-1"><Clock className="w-4 h-4" />{session.duration}</span></div>
              </div>
              <div className="p-4 space-y-3">
                {session.lessonsLearned && <div className="bg-purple-50 border border-purple-200 rounded-lg p-3"><div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-purple-700" /><span className="text-sm font-semibold text-purple-900">What I Learned</span></div><p className="text-sm text-purple-800">{session.lessonsLearned}</p></div>}
                {session.drillsToWork && <div className="bg-gray-50 rounded-lg p-3"><div className="text-sm font-semibold text-gray-700 mb-2">Drills to Work On</div><p className="text-sm text-gray-600">{session.drillsToWork}</p></div>}
              </div>
            </motion.div>
          ))
        )}
      </div>
      <OneOnOneModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {selectedSession && <SessionDetailModal session={sessions.find(s => s.id === selectedSession)!} isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  );
}
