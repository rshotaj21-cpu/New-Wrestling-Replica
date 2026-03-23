import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Flame, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useData, TrainingSession } from "@/context/DataContext";
import { SessionModal } from "./SessionModal";
import { GoalModal } from "./GoalModal";

const sessionTypes = ["Training", "Sparring", "S&C", "Competition", "1-2-1"] as const;
type SessionType = (typeof sessionTypes)[number];

const typeConfig: Record<string, { bg: string; dot: string; border: string; text: string; label: string }> = {
  Training:    { bg: "bg-blue-50",   dot: "bg-blue-500",   border: "border-blue-400", text: "text-blue-700",   label: "Training" },
  Sparring:    { bg: "bg-emerald-50",dot: "bg-emerald-500",border: "border-emerald-400", text: "text-emerald-700",label: "Sparring" },
  Competition: { bg: "bg-rose-50",   dot: "bg-rose-500",   border: "border-rose-400", text: "text-rose-700",   label: "Competition" },
  "S&C":       { bg: "bg-amber-50",  dot: "bg-amber-500",  border: "border-amber-400",text: "text-amber-700",  label: "S&C" },
  "1-2-1":     { bg: "bg-violet-50", dot: "bg-violet-500", border: "border-violet-400",text: "text-violet-700", label: "1-2-1" },
};

function computeSparringTime(sessions: TrainingSession[]): number {
  return sessions.reduce((acc, s) => {
    if ((s.type === "Training" && s.hasSparring) || s.type === "Sparring") {
      if (s.rounds && s.roundDuration) {
        const m = s.roundDuration.match(/(\d+)/);
        if (m) return acc + (s.rounds * parseInt(m[1]));
      }
    }
    return acc;
  }, 0);
}

function computeSparringRounds(sessions: TrainingSession[]): number {
  return sessions.reduce((acc, s) => {
    if ((s.type === "Training" && s.hasSparring) || s.type === "Sparring") {
      return acc + (s.rounds || 0);
    }
    return acc;
  }, 0);
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function computeStreak(sessions: TrainingSession[], goal: { frequency: number; customTotal?: number; goalType?: string }): { current: number; best: number; target: number; period: string } {
  const goalType = goal.goalType || "weekly";
  const target = goalType === "monthly"
    ? (goal.frequency === 0 ? (goal.customTotal || 10) : goal.frequency)
    : (goal.frequency === 0 ? Math.ceil((goal.customTotal || 52) / 12) : goal.frequency * 4);
  const period = goalType === "monthly" ? "month" : "month";

  // Group sessions by month
  const monthMap = new Map<string, number>();
  sessions.forEach((s) => {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  });

  // Calculate streak of consecutive months hitting the target
  const now = new Date();
  let current = 0;
  let best = 0;
  let tempStreak = 0;

  // Check last 24 months
  for (let i = 0; i < 24; i++) {
    const checkDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}`;
    const count = monthMap.get(key) || 0;

    if (count >= target) {
      tempStreak++;
      if (i === 0 || current === i) current = tempStreak;
      best = Math.max(best, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { current, best, target, period };
}

export function CalendarView() {
  const { sessions, goal } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<SessionType>>(new Set(sessionTypes));
  const [showFilters, setShowFilters] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const toggleFilter = (type: SessionType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const filteredSessions = useMemo(
    () => sessions.filter((s) => activeFilters.has(s.type as SessionType)),
    [sessions, activeFilters]
  );

  const getSessionsForDate = (dateStr: string) => filteredSessions.filter((s) => s.date === dateStr);
  const selectedDaySessions = selectedDay ? filteredSessions.filter((s) => s.date === selectedDay) : [];

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const streak = useMemo(() => computeStreak(sessions, goal), [sessions, goal]);

  // Monthly stats
  const monthlySessions = useMemo(
    () => filteredSessions.filter((s) => { const d = new Date(s.date); return d.getFullYear() === year && d.getMonth() === month; }),
    [filteredSessions, year, month]
  );

  const monthlyStats = useMemo(() => {
    const byType = (type: string) => monthlySessions.filter((s) => s.type === type).length;
    return {
      training: byType("Training"),
      sc: byType("S&C"),
      competition: byType("Competition"),
      oneOnOne: byType("1-2-1"),
      sparring: byType("Sparring"),
      sparringRounds: computeSparringRounds(monthlySessions),
      sparringTime: computeSparringTime(monthlySessions),
      total: monthlySessions.length,
    };
  }, [monthlySessions]);

  // Yearly stats
  const yearlySessions = useMemo(
    () => filteredSessions.filter((s) => new Date(s.date).getFullYear() === year),
    [filteredSessions, year]
  );

  const yearlyStats = useMemo(() => {
    const byType = (type: string) => yearlySessions.filter((s) => s.type === type).length;
    return {
      training: byType("Training"),
      sc: byType("S&C"),
      competition: byType("Competition"),
      oneOnOne: byType("1-2-1"),
      sparring: byType("Sparring"),
      sparringRounds: computeSparringRounds(yearlySessions),
      sparringTime: computeSparringTime(yearlySessions),
      total: yearlySessions.length,
    };
  }, [yearlySessions]);

  const renderMonthView = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    return (
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="aspect-square" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const daySessions = getSessionsForDate(dateStr);
          const isToday = isCurrentMonth && today.getDate() === day;
          const isSelected = selectedDay === dateStr;
          const uniqueTypes = [...new Set(daySessions.map((s) => s.type))];

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(selectedDay === dateStr ? null : dateStr)}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative overflow-hidden ${
                isToday
                  ? "bg-gray-900 text-white font-bold shadow-md"
                  : isSelected
                  ? "ring-2 ring-gray-900 bg-gray-50"
                  : daySessions.length > 0
                  ? "hover:bg-gray-50"
                  : "hover:bg-gray-50/50"
              }`}
            >
              {/* Colored edge indicators for session types */}
              {uniqueTypes.length > 0 && !isToday && (
                <div className="absolute bottom-0 left-0 right-0 flex h-1 gap-0">
                  {uniqueTypes.map((type) => (
                    <div key={type} className={`flex-1 ${typeConfig[type]?.dot || "bg-gray-400"}`} />
                  ))}
                </div>
              )}
              <span className={`text-sm font-medium ${isToday ? "text-white" : "text-gray-900"}`}>{day}</span>
              {daySessions.length > 1 && (
                <span className={`text-[10px] font-semibold mt-0.5 ${isToday ? "text-white/70" : "text-gray-400"}`}>
                  ×{daySessions.length}
                </span>
              )}
              {isToday && uniqueTypes.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 flex h-1 gap-0">
                  {uniqueTypes.map((type) => (
                    <div key={type} className={`flex-1 ${typeConfig[type]?.dot || "bg-gray-400"} opacity-80`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderYearView = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (
      <div className="grid grid-cols-3 gap-3">
        {months.map((monthName, monthIndex) => {
          const mSessions = filteredSessions.filter((s) => {
            const d = new Date(s.date);
            return d.getFullYear() === year && d.getMonth() === monthIndex;
          });
          const total = mSessions.length;
          const uniqueTypes = [...new Set(mSessions.map((s) => s.type))];
          const isCurrent = monthIndex === month && year === new Date().getFullYear();

          return (
            <button
              key={monthIndex}
              onClick={() => { setCurrentDate(new Date(year, monthIndex, 1)); setViewMode("month"); }}
              className={`p-3 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                isCurrent
                  ? "border-gray-900 bg-gray-50"
                  : total > 0
                  ? "border-gray-200 bg-white hover:border-gray-300"
                  : "border-gray-100 bg-gray-50/50 hover:bg-gray-100"
              }`}
            >
              <div className="font-semibold text-gray-900 text-sm">{monthName}</div>
              {total > 0 ? (
                <>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">{total}</div>
                  <div className="flex gap-1 mt-1.5">
                    {uniqueTypes.map((type) => (
                      <div key={type} className={`h-1.5 flex-1 rounded-full ${typeConfig[type]?.dot || "bg-gray-400"}`} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 mt-1">—</div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const stats = viewMode === "month" ? monthlyStats : yearlyStats;
  const statsLabel = viewMode === "month" ? `${monthNames[month]} Summary` : `${year} Summary`;

  return (
    <>
      <div className="p-4 max-w-md mx-auto space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-sm text-gray-500">Track your training schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl transition-colors ${showFilters ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pb-1">
                {sessionTypes.map((type) => {
                  const cfg = typeConfig[type];
                  const active = activeFilters.has(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleFilter(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        active
                          ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                          : "bg-gray-50 text-gray-400 border-gray-200"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${active ? cfg.dot : "bg-gray-300"}`} />
                      {cfg.label}
                      {active && (
                        <X className="w-3 h-3 ml-0.5 opacity-60" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View mode toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode("month")} className={`flex-1 py-2 px-4 rounded-md transition-all font-medium text-sm ${viewMode === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Month
          </button>
          <button onClick={() => setViewMode("year")} className={`flex-1 py-2 px-4 rounded-md transition-all font-medium text-sm ${viewMode === "year" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Year
          </button>
        </div>

        {/* Calendar */}
        <motion.div className="bg-white rounded-2xl shadow-sm p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setCurrentDate(new Date(viewMode === "year" ? year - 1 : year, viewMode === "month" ? month - 1 : month, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-semibold text-gray-900">{viewMode === "month" ? `${monthNames[month]} ${year}` : year}</h2>
            <button
              onClick={() => setCurrentDate(new Date(viewMode === "year" ? year + 1 : year, viewMode === "month" ? month + 1 : month, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {viewMode === "month" && (
            <>
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={`${day}-${i}`} className="text-center text-xs font-semibold text-gray-400 py-1">{day}</div>
                ))}
              </div>
              {renderMonthView()}
            </>
          )}
          {viewMode === "year" && renderYearView()}
        </motion.div>

        {/* Selected day detail */}
        <AnimatePresence>
          {selectedDay && selectedDaySessions.length > 0 && (
            <motion.div
              className="bg-white rounded-2xl shadow-sm p-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
                </h3>
                <button onClick={() => setSelectedDay(null)} className="text-xs text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {selectedDaySessions.map((session) => {
                  const cfg = typeConfig[session.type] || typeConfig.Training;
                  return (
                    <div
                      key={session.id}
                      className={`p-3 rounded-xl border-l-4 ${cfg.border} ${cfg.bg} flex items-center justify-between`}
                    >
                      <div>
                        <div className={`font-semibold text-sm ${cfg.text}`}>{session.type}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{session.duration}</div>
                      </div>
                      <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.dot} text-white`}>
                        {session.rating}★
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak card */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-gray-700">Monthly Streak</h3>
            </div>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              Edit goal
            </button>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-3xl font-bold text-gray-900 tabular-nums">{streak.current}</div>
              <div className="text-xs text-gray-500 mt-0.5">consecutive months</div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-sm text-gray-500">
                Best: <span className="font-semibold text-gray-700">{streak.best}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Target: {streak.target} sessions/month
              </div>
            </div>
          </div>
          {/* Current month progress toward target */}
          {viewMode === "month" && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{monthlyStats.total} of {streak.target} this month</span>
                <span>{Math.min(100, Math.round((monthlyStats.total / streak.target) * 100))}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${monthlyStats.total >= streak.target ? "bg-emerald-500" : "bg-gray-900"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (monthlyStats.total / streak.target) * 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats summary */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{statsLabel}</h3>

          {/* Session type counts */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Training", count: stats.training, cfg: typeConfig.Training },
              { label: "S&C", count: stats.sc, cfg: typeConfig["S&C"] },
              { label: "Competition", count: stats.competition, cfg: typeConfig.Competition },
              { label: "1-2-1", count: stats.oneOnOne, cfg: typeConfig["1-2-1"] },
              { label: "Spar Rounds", count: stats.sparringRounds, cfg: typeConfig.Sparring },
              { label: "Time Sparring", count: formatMinutes(stats.sparringTime), cfg: typeConfig.Sparring },
            ].map((item) => (
              <div key={item.label} className={`${item.cfg.bg} rounded-xl p-3`}>
                <div className={`text-2xl font-bold tabular-nums ${item.cfg.text}`}>{item.count}</div>
                <div className={`text-xs ${item.cfg.text} opacity-80`}>{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Legend</h3>
          <div className="grid grid-cols-2 gap-2">
            {sessionTypes.map((type) => {
              const cfg = typeConfig[type];
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className="text-sm text-gray-600">{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <SessionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} type="Training" />
      <GoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} />
    </>
  );
}
