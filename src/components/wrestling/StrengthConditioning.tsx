import { motion } from "framer-motion";
import { Dumbbell, Zap, Activity, Clock, Plus, BookOpen, Calendar, Award, TrendingUp, ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import { useData, TrainingSession } from "@/context/DataContext";
import { SCSessionModal } from "./SCSessionModal";
import { CreateProgramModal } from "./CreateProgramModal";
import { ManageExercisesModal } from "./ManageExercisesModal";
import { SessionDetailModal } from "./SessionDetailModal";
import { PRManagementModal } from "./PRManagementModal";
import { ProgramDetailModal } from "./ProgramDetailModal";

export function StrengthConditioning() {
  const { sessions, programs, personalRecords } = useData();
  const [showSCModal, setShowSCModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [prefillSession, setPrefillSession] = useState<Partial<TrainingSession> | null>(null);

  const scSessions = sessions.filter(s => s.type === "S&C");
  const typeColors: Record<string, string> = { Strength: "from-orange-600 to-orange-700", Power: "from-purple-600 to-purple-700", Conditioning: "from-red-600 to-red-700" };
  const typeIcons: Record<string, typeof Dumbbell> = { Strength: Dumbbell, Power: Zap, Conditioning: Activity };

  const selectedProgram = programs.find(p => p.id === selectedProgramId);

  const handleStartSessionFromProgram = (programId: string, weekNumber: number, sessionIndex: number) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;
    const week = program.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return;
    const templateSession = week.sessions[sessionIndex];
    if (!templateSession) return;

    setPrefillSession({
      type: "S&C",
      date: new Date().toISOString().split("T")[0],
      duration: "",
      rating: 3,
      techniques: [],
      notes: `Program: ${program.name} — Week ${weekNumber}, ${templateSession.day}`,
      scType: templateSession.type,
      focus: templateSession.focus,
      exercises: templateSession.exercises.map(ex => ({
        name: ex.exerciseName,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        exerciseId: ex.exerciseId,
      })),
      rpe: 5,
      programId: program.id,
      weekNumber,
    });
    setSelectedProgramId(null);
    setShowSCModal(true);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Strength & Conditioning</h1>
        <p className="text-sm text-gray-500">Physical preparation</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { setPrefillSession(null); setShowSCModal(true); }} className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 active:scale-[0.97]">
          <Plus className="w-6 h-6" /><span className="font-semibold text-sm">Log Session</span>
        </button>
        <button onClick={() => setShowProgramModal(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 active:scale-[0.97]">
          <Calendar className="w-6 h-6" /><span className="font-semibold text-sm">Create Program</span>
        </button>
        <button onClick={() => setShowExercisesModal(true)} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 active:scale-[0.97]">
          <BookOpen className="w-6 h-6" /><span className="font-semibold text-sm">Manage Exercises</span>
        </button>
        <button onClick={() => setShowPRModal(true)} className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-1 active:scale-[0.97]">
          <Award className="w-6 h-6" /><span className="font-semibold text-sm">{personalRecords.length} PRs</span><span className="text-xs opacity-90">Personal Records</span>
        </button>
      </div>

      {/* My Programs section */}
      {programs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> My Programs
          </h2>
          {programs.map((program, index) => {
            const linkedCount = sessions.filter(s => s.programId === program.id).length;
            return (
              <motion.div
                key={program.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => setSelectedProgramId(program.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-semibold text-gray-900">{program.name}</h3>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${program.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {program.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-gray-500">{program.duration} weeks</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{program.weeks.reduce((a, w) => a + w.sessions.length, 0)} sessions</span>
                    {linkedCount > 0 && (
                      <>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-blue-600 font-medium">{linkedCount} logged</span>
                      </>
                    )}
                  </div>
                  {program.isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const firstWeek = program.weeks[0];
                        if (firstWeek && firstWeek.sessions.length > 0) {
                          handleStartSessionFromProgram(program.id, firstWeek.weekNumber, 0);
                        }
                      }}
                      className="mt-3 w-full py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Start Next Session
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" /> Recent Personal Records
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {personalRecords.slice(0, 5).map((pr, idx) => (
              <div key={idx} className="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{pr.exerciseName}</div>
                    <div className="text-sm text-gray-600">{pr.weight} × {pr.reps} reps</div>
                  </div>
                  <div className="text-right">
                    <Award className="w-5 h-5 text-green-700 mx-auto" />
                    <div className="text-xs text-gray-500">{pr.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Session History</h2>
        {scSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No S&C sessions logged yet</p>
          </div>
        ) : (
          scSessions.map((session, index) => {
            const Icon = typeIcons[session.scType as string] || Dumbbell;
            const linkedProgram = session.programId ? programs.find(p => p.id === session.programId) : null;
            return (
              <motion.div
                key={session.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSession(session.id)}
              >
                <div className={`bg-gradient-to-r ${typeColors[session.scType as string] || typeColors.Strength} p-4 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-semibold">{session.scType}</h3>
                    </div>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded-md">RPE {session.rpe}</span>
                  </div>
                  <p className="text-sm opacity-90">{new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  {linkedProgram && (
                    <div className="mt-1 text-xs bg-white/15 px-2 py-0.5 rounded inline-block">
                      📋 {linkedProgram.name}{session.weekNumber ? ` — Week ${session.weekNumber}` : ""}
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Focus</div>
                      <div className="font-semibold text-gray-900">{session.focus}</div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Clock className="w-3 h-3" /><span>Duration</span></div>
                      <div className="font-semibold text-gray-900">{session.duration}</div>
                    </div>
                  </div>
                  {session.exercises && session.exercises.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Exercises</div>
                      <div className="space-y-2">
                        {session.exercises.map((ex, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="font-medium text-gray-900 mb-1">{ex.name}</div>
                            <div className="text-gray-600 text-xs">{ex.sets} sets × {ex.reps} reps @ {ex.weight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <SCSessionModal isOpen={showSCModal} onClose={() => { setShowSCModal(false); setPrefillSession(null); }} prefill={prefillSession || undefined} />
      <CreateProgramModal isOpen={showProgramModal} onClose={() => setShowProgramModal(false)} />
      <ManageExercisesModal isOpen={showExercisesModal} onClose={() => setShowExercisesModal(false)} />
      <PRManagementModal isOpen={showPRModal} onClose={() => setShowPRModal(false)} />
      {selectedSession && <SessionDetailModal session={sessions.find(s => s.id === selectedSession)!} isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} />}
      {selectedProgram && (
        <ProgramDetailModal
          isOpen={!!selectedProgram}
          onClose={() => setSelectedProgramId(null)}
          program={selectedProgram}
          onStartSession={handleStartSessionFromProgram}
        />
      )}
    </div>
  );
}
