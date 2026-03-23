import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, Trophy, Settings, Plus, Swords } from "lucide-react";
import { ProgressBar } from "@/components/wrestling/ProgressBar";
import { SessionModal } from "@/components/wrestling/SessionModal";
import { GoalModal } from "@/components/wrestling/GoalModal";
import { useData } from "@/context/DataContext";

export function Dashboard() {
  const { sessions, goal, totalSparringRounds } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"Training" | "Sparring" | "S&C" | "Competition">("Training");
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const sessionsThisYear = sessions.filter((s) => new Date(s.date) >= yearStart).length;
  const isMonthly = goal.goalType === "monthly";
  const yearlyGoal = isMonthly
    ? (goal.frequency === 0 ? (goal.customTotal || 10) * 12 : goal.frequency * 12)
    : (goal.customTotal || goal.frequency * 52);
  const progressPercentage = (sessionsThisYear / yearlyGoal) * 100;
  const goalLabel = isMonthly
    ? `${goal.frequency === 0 ? (goal.customTotal || 10) : goal.frequency}x per month goal`
    : `${goal.frequency > 0 ? goal.frequency + "x per week" : "Custom"} goal`;

  const calculateHours = (duration: string): number => {
    const hourMatch = duration.match(/(\d+)h/);
    const minMatch = duration.match(/(\d+)m/);
    return (hourMatch ? parseInt(hourMatch[1]) : 0) + (minMatch ? parseInt(minMatch[1]) : 0) / 60;
  };

  const totalMatHours = Math.round(
    sessions.filter((s) => s.type === "Training" || s.type === "Sparring").reduce((sum, s) => sum + calculateHours(s.duration), 0)
  );

  const totalMatches = sessions.filter((s) => s.type === "Competition" && s.matches).reduce((sum, s) => sum + (s.matches?.length || 0), 0);

  const calculateStreak = () => {
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= streak + 1) { if (daysDiff === streak) streak++; } else break;
    }
    return streak;
  };
  const trainingStreak = calculateStreak();

  const openModal = (type: "Training" | "Sparring" | "S&C" | "Competition") => { setModalType(type); setIsModalOpen(true); };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <>
      <motion.div className="p-4 max-w-md mx-auto space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Track your wrestling journey</p>
        </div>

        <motion.div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-md text-white relative" variants={cardVariants}>
          <button onClick={() => setIsGoalModalOpen(true)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"><Settings className="w-4 h-4" /></button>
          <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-semibold flex items-center gap-1.5">Training Progress <Flame className="w-5 h-5" /></h2></div>
          <div className="mb-2"><div className="flex items-baseline gap-2"><span className="text-3xl font-bold">{sessionsThisYear}</span><span className="text-blue-100">/ {yearlyGoal} Sessions</span></div><div className="text-xs text-blue-100 mt-1">{goalLabel}</div></div>
          <ProgressBar value={progressPercentage} className="bg-blue-400/30" barClassName="bg-white" />
        </motion.div>

        <motion.div className="grid grid-cols-3 gap-3" variants={cardVariants}>
          <div className="bg-white rounded-xl p-4 shadow-sm"><Clock className="w-5 h-5 text-blue-500 mb-2" /><div className="text-2xl font-bold text-gray-900">{totalMatHours}</div><div className="text-xs text-gray-500">Mat Hours</div></div>
          <div className="bg-white rounded-xl p-4 shadow-sm"><Trophy className="w-5 h-5 text-red-500 mb-2" /><div className="text-2xl font-bold text-gray-900">{totalMatches}</div><div className="text-xs text-gray-500">Matches</div></div>
          <div className="bg-white rounded-xl p-4 shadow-sm"><Swords className="w-5 h-5 text-green-500 mb-2" /><div className="text-2xl font-bold text-gray-900">{totalSparringRounds}</div><div className="text-xs text-gray-500">Spar Rounds</div></div>
        </motion.div>

        <motion.div className="bg-white rounded-2xl p-6 shadow-sm" variants={cardVariants}>
          <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Current Focus</h3><div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" /></div>
          <div className="mb-4"><h2 className="text-xl font-bold text-gray-900 mb-1">Blast Double</h2><p className="text-sm text-gray-500">Neutral Position</p></div>
          <div className="mb-2"><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Progress</span><span className="font-semibold text-gray-900">42 / 100 reps</span></div><ProgressBar value={42} className="bg-gray-100" barClassName="bg-yellow-400" /></div>
        </motion.div>

        <motion.div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-md text-white" variants={cardVariants}>
          <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Upcoming Competition</h3><Trophy className="w-5 h-5" /></div>
          <h2 className="text-xl font-bold mb-2">State Championship</h2>
          <div className="flex items-center gap-4 text-sm opacity-90"><span>📅 April 15, 2026</span><span>⚖️ 74kg</span></div>
          <div className="mt-4 text-xs bg-white/20 rounded-lg px-3 py-2 inline-block">12 days away</div>
        </motion.div>

        <motion.div variants={cardVariants}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => openModal("Training")} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-4 shadow-sm transition-colors flex flex-col items-center gap-2 active:scale-[0.97]"><Plus className="w-5 h-5" /><span className="text-sm font-medium">Log Training</span></button>
            <button onClick={() => openModal("Sparring")} className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 shadow-sm transition-colors flex flex-col items-center gap-2 active:scale-[0.97]"><Plus className="w-5 h-5" /><span className="text-sm font-medium">Log Sparring</span></button>
            <button onClick={() => openModal("S&C")} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 shadow-sm transition-colors flex flex-col items-center gap-2 active:scale-[0.97]"><Plus className="w-5 h-5" /><span className="text-sm font-medium">Log S&C</span></button>
            <button onClick={() => openModal("Competition")} className="bg-red-500 hover:bg-red-600 text-white rounded-xl p-4 shadow-sm transition-colors flex flex-col items-center gap-2 active:scale-[0.97]"><Plus className="w-5 h-5" /><span className="text-sm font-medium">Log Competition</span></button>
          </div>
        </motion.div>

        <motion.div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 shadow-md text-white" variants={cardVariants}>
          <div className="flex items-center justify-between"><div><div className="text-sm font-semibold uppercase tracking-wide opacity-90 mb-1">Training Streak</div><div className="text-4xl font-bold">{trainingStreak} {trainingStreak === 1 ? "day" : "days"} 🔥</div></div><Flame className="w-12 h-12 opacity-80" /></div>
        </motion.div>
      </motion.div>

      <SessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type={modalType} />
      <GoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} />
    </>
  );
}
