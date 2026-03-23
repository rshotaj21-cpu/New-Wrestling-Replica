import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Target, Clock, Trophy } from "lucide-react";
import { useData } from "@/context/DataContext";

const monthlyData = [
  { month: "Sep", sessions: 18 }, { month: "Oct", sessions: 22 }, { month: "Nov", sessions: 19 },
  { month: "Dec", sessions: 24 }, { month: "Jan", sessions: 21 }, { month: "Feb", sessions: 26 }, { month: "Mar", sessions: 14 },
];

const techniqueData = [
  { name: "Blast Double", rate: 71 }, { name: "High Crotch", rate: 74 }, { name: "Duck Under", rate: 76 },
  { name: "Single Leg", rate: 67 }, { name: "Ankle Pick", rate: 72 },
];

const matTimeData = [
  { month: "Sep", hours: 28 }, { month: "Oct", hours: 34 }, { month: "Nov", hours: 30 },
  { month: "Dec", hours: 38 }, { month: "Jan", hours: 32 }, { month: "Feb", hours: 42 }, { month: "Mar", hours: 22 },
];

export function Stats() {
  const { totalMatHours, totalSessions, totalTrainingHours, totalMatches } = useData();

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-6">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Statistics</h1><p className="text-sm text-gray-500">Performance analytics</p></div>

      <motion.div className="grid grid-cols-2 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-md"><Clock className="w-5 h-5 mb-2 opacity-80" /><div className="text-3xl font-bold mb-1">{Math.round(totalMatHours)}</div><div className="text-xs opacity-90">Mat Hours</div></div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-white shadow-md"><Target className="w-5 h-5 mb-2 opacity-80" /><div className="text-3xl font-bold mb-1">{totalSessions}</div><div className="text-xs opacity-90">Training Sessions</div></div>
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 text-white shadow-md"><TrendingUp className="w-5 h-5 mb-2 opacity-80" /><div className="text-3xl font-bold mb-1">{Math.round(totalTrainingHours)}</div><div className="text-xs opacity-90">Training Hours</div></div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 text-white shadow-md"><Trophy className="w-5 h-5 mb-2 opacity-80" /><div className="text-3xl font-bold mb-1">{totalMatches}</div><div className="text-xs opacity-90">Total Matches</div></div>
      </motion.div>

      <motion.div className="bg-white rounded-2xl shadow-sm p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Sessions</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" /><YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" /><Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} /><Bar dataKey="sessions" fill="#3b82f6" radius={[8, 8, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div className="bg-white rounded-2xl shadow-sm p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-semibold text-gray-900 mb-4">Mat Time Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={matTimeData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" /><YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" /><Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} /><Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} /></LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div className="bg-white rounded-2xl shadow-sm p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="font-semibold text-gray-900 mb-4">Top Technique Success Rates</h3>
        <div className="space-y-3">
          {techniqueData.map((tech, idx) => (
            <div key={tech.name}><div className="flex items-center justify-between text-sm mb-1"><span className="text-gray-700">{tech.name}</span><span className="font-semibold text-gray-900">{tech.rate}%</span></div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${tech.rate}%` }} transition={{ duration: 1, delay: 0.3 + idx * 0.1 }} /></div></div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-md p-4 text-white" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h3 className="font-semibold mb-3">Personal Best</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-sm opacity-90">Longest Win Streak</span><span className="text-xl font-bold">8 matches</span></div>
          <div className="flex justify-between items-center"><span className="text-sm opacity-90">Most Sessions in Month</span><span className="text-xl font-bold">26 sessions</span></div>
          <div className="flex justify-between items-center"><span className="text-sm opacity-90">Current Streak</span><span className="text-xl font-bold">7 days 🔥</span></div>
        </div>
      </motion.div>
    </div>
  );
}
