import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Exercise {
  id: string;
  name: string;
  category: "Upper Body" | "Lower Body" | "Core" | "Cardio" | "Olympic Lifts" | "Accessories";
  isCustom: boolean;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: string;
  reps: number;
  date: string;
  sessionId: string;
}

export interface ProgramWeek {
  weekNumber: number;
  sessions: Array<{
    day: string;
    type: "Strength" | "Power" | "Conditioning";
    focus: string;
    exercises: Array<{ exerciseId: string; exerciseName: string; sets: number; reps: number; weight: string; notes?: string }>;
  }>;
}

export interface SCProgram {
  id: string;
  name: string;
  duration: number;
  weeks: ProgramWeek[];
  startDate?: string;
  isActive: boolean;
  createdDate: string;
}

export interface TechniqueGoal {
  id: string;
  targetReps: number;
  completedReps: number;
  period: "weekly" | "monthly" | "custom";
  customDays?: number;
  startDate: string;
  endDate?: string;
  focusReason: string;
  status: "active" | "completed";
  completionReflection?: {
    whatWentWell: string;
    improvements: string;
  };
  repLogs: Array<{ date: string; reps: number; notes?: string }>;
}

export interface Technique {
  id: string;
  name: string;
  category: "Neutral" | "Top" | "Bottom";
  attempts: number;
  finishes: number;
  videoLinks?: Array<{ url: string; title: string }>;
  setups?: string[];
  goals: TechniqueGoal[];
  isCustom: boolean;
}

export interface TechniqueVideo {
  id: string;
  techniqueId: string;
  techniqueName: string;
  videoUrl: string;
  uploadDate: string;
  duration?: string;
  selfReflection: string;
  tags?: string[];
  coachFeedback?: string;
  peerFeedback?: Array<{ name: string; comment: string; date: string }>;
}

export interface SystemNode {
  id: string;
  type: "trigger" | "setup" | "attack" | "backup" | "top" | "bottom" | "defence";
  label: string;
  description?: string;
  techniqueId?: string;
  position: { x: number; y: number };
}

export interface SystemConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  condition?: "success" | "fail" | "default";
}

export interface WrestlingSystem {
  id: string;
  name: string;
  description?: string;
  nodes: SystemNode[];
  connections: SystemConnection[];
  createdDate: string;
}

export interface ScheduledSession {
  id: string;
  date: string;
  type: "Training" | "S&C" | "1-2-1" | "Competition";
  status: "scheduled" | "completed" | "missed";
  suggestedBy: "ai" | "user";
  reason?: string;
}

export interface TrainingSession {
  id: string;
  type: "Training" | "S&C" | "Competition" | "1-2-1" | "Sparring";
  date: string;
  duration: string;
  rating: number;
  techniques: string[];
  notes: string;
  hasSparring?: boolean;
  rounds?: number;
  roundDuration?: string;
  endurance?: number;
  performance?: number;
  techniqueUsage?: Array<{ name: string; attempts: number }>;
  whatWentWell?: string;
  whatDidntGoWell?: string;
  scType?: "Strength" | "Power" | "Conditioning";
  focus?: string;
  exercises?: Array<{ name: string; sets: number; reps: number; weight: string; exerciseId?: string }>;
  conditioning?: { type: string; intervals: string; rounds: number };
  rpe?: number;
  programId?: string;
  weekNumber?: number;
  name?: string;
  weightClass?: string;
  placement?: "gold" | "silver" | "bronze" | "upcoming";
  matches?: Array<{ opponent: string; result: string; method: string; time?: string; score?: string }>;
  competitionWhatWentWell?: string;
  competitionWhatDidntGoWell?: string;
  coachName?: string;
  drillsToWork?: string;
  lessonsLearned?: string;
}

export interface TrainingGoal {
  frequency: number;
  customTotal?: number;
  goalType?: "weekly" | "monthly";
}

interface DataContextType {
  sessions: TrainingSession[];
  addSession: (session: TrainingSession) => void;
  updateSession: (id: string, session: TrainingSession) => void;
  deleteSession: (id: string) => void;
  goal: TrainingGoal;
  setGoal: (goal: TrainingGoal) => void;
  totalMatHours: number;
  totalSessions: number;
  totalTrainingHours: number;
  totalMatches: number;
  totalSparringRounds: number;
  exercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, exercise: Exercise) => void;
  deleteExercise: (id: string) => void;
  programs: SCProgram[];
  addProgram: (program: SCProgram) => void;
  updateProgram: (id: string, program: SCProgram) => void;
  deleteProgram: (id: string) => void;
  personalRecords: PersonalRecord[];
  updatePersonalRecord: (pr: PersonalRecord) => void;
  deletePersonalRecord: (exerciseId: string) => void;
  getPersonalRecord: (exerciseId: string) => PersonalRecord | undefined;
  techniqueVideos: TechniqueVideo[];
  addTechniqueVideo: (video: TechniqueVideo) => void;
  updateTechniqueVideo: (id: string, video: TechniqueVideo) => void;
  scheduledSessions: ScheduledSession[];
  addScheduledSession: (session: ScheduledSession) => void;
  deleteScheduledSession: (id: string) => void;
  techniques: Technique[];
  addTechnique: (technique: Technique) => void;
  updateTechnique: (id: string, technique: Technique) => void;
  deleteTechnique: (id: string) => void;
  wrestlingSystems: WrestlingSystem[];
  addWrestlingSystem: (system: WrestlingSystem) => void;
  updateWrestlingSystem: (id: string, system: WrestlingSystem) => void;
  deleteWrestlingSystem: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultExercises: Exercise[] = [
  { id: "ex1", name: "Back Squat", category: "Lower Body", isCustom: false },
  { id: "ex2", name: "Front Squat", category: "Lower Body", isCustom: false },
  { id: "ex3", name: "Deadlift", category: "Lower Body", isCustom: false },
  { id: "ex4", name: "Romanian Deadlift", category: "Lower Body", isCustom: false },
  { id: "ex5", name: "Bulgarian Split Squat", category: "Lower Body", isCustom: false },
  { id: "ex6", name: "Bench Press", category: "Upper Body", isCustom: false },
  { id: "ex7", name: "Overhead Press", category: "Upper Body", isCustom: false },
  { id: "ex8", name: "Pull-ups", category: "Upper Body", isCustom: false },
  { id: "ex9", name: "Weighted Pull-ups", category: "Upper Body", isCustom: false },
  { id: "ex10", name: "Barbell Row", category: "Upper Body", isCustom: false },
  { id: "ex11", name: "Power Clean", category: "Olympic Lifts", isCustom: false },
  { id: "ex12", name: "Clean and Jerk", category: "Olympic Lifts", isCustom: false },
  { id: "ex13", name: "Snatch", category: "Olympic Lifts", isCustom: false },
  { id: "ex14", name: "Box Jump", category: "Lower Body", isCustom: false },
  { id: "ex15", name: "Med Ball Slam", category: "Core", isCustom: false },
];

const generateInitialSessions = (): TrainingSession[] => [
  {
    id: "1",
    type: "Training",
    date: "2026-03-18",
    duration: "2h 30m",
    rating: 4.5,
    techniques: ["Single Leg", "Hi-C"],
    notes: "Great session, felt strong",
    hasSparring: true,
    rounds: 6,
    roundDuration: "5 min",
    endurance: 75,
    performance: 80,
    whatWentWell: "Good scrambles and hand fighting",
    whatDidntGoWell: "Need to work on finishing singles",
  },
  {
    id: "2",
    type: "S&C",
    date: "2026-03-17",
    duration: "45m",
    rating: 4,
    techniques: [],
    notes: "Lower body strength day",
    scType: "Strength",
    focus: "Lower Body",
    exercises: [
      { name: "Back Squat", sets: 5, reps: 5, weight: "225 lbs" },
      { name: "Romanian Deadlift", sets: 4, reps: 8, weight: "185 lbs" },
    ],
    rpe: 8,
  },
  {
    id: "3",
    type: "Competition",
    date: "2026-03-16",
    duration: "3h",
    rating: 5,
    techniques: [],
    notes: "Competition day",
    name: "State Championship",
    weightClass: "152 lbs",
    placement: "gold",
    matches: [
      { opponent: "Marcus Rivera", result: "win", method: "pin", time: "2:30" },
      { opponent: "Tyler Brooks", result: "win", method: "pin", time: "3:00" },
    ],
    competitionWhatWentWell: "Maintained good pace throughout",
    competitionWhatDidntGoWell: "Need to work on finishing singles",
  },
  {
    id: "4",
    type: "1-2-1",
    date: "2026-03-15",
    duration: "1h 30m",
    rating: 4.5,
    techniques: [],
    notes: "1-2-1 session with coach",
    coachName: "Coach Ramirez",
    drillsToWork: "Single leg takedown, high crotch",
    lessonsLearned: "Improved single leg takedown technique",
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<TrainingSession[]>(() => {
    const stored = localStorage.getItem("wrestlingTrackerSessions");
    return stored ? JSON.parse(stored) : generateInitialSessions();
  });

  const [goal, setGoal] = useState<TrainingGoal>(() => {
    const stored = localStorage.getItem("wrestlingTrackerGoal");
    return stored ? JSON.parse(stored) : { frequency: 3, goalType: "weekly" };
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const stored = localStorage.getItem("wrestlingTrackerExercises");
    return stored ? JSON.parse(stored) : defaultExercises;
  });

  const [programs, setPrograms] = useState<SCProgram[]>(() => {
    const stored = localStorage.getItem("wrestlingTrackerPrograms");
    return stored ? JSON.parse(stored) : [];
  });

  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
    const stored = localStorage.getItem("wrestlingTrackerPersonalRecords");
    return stored ? JSON.parse(stored) : [];
  });

  const [techniqueVideos, setTechniqueVideos] = useState<TechniqueVideo[]>(() => {
    const stored = localStorage.getItem("wrestlingTrackerTechniqueVideos");
    return stored ? JSON.parse(stored) : [];
  });

  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>(() => {
    const stored = localStorage.getItem("wrestlingTrackerScheduledSessions");
    return stored ? JSON.parse(stored) : [];
  });

  const defaultTechniques: Technique[] = [
    { id: "t1", name: "Blast Double", category: "Neutral", attempts: 45, finishes: 32, goals: [], isCustom: false },
    { id: "t2", name: "High Crotch", category: "Neutral", attempts: 38, finishes: 28, goals: [], isCustom: false },
    { id: "t3", name: "Single Leg", category: "Neutral", attempts: 52, finishes: 35, goals: [], isCustom: false },
    { id: "t4", name: "Ankle Pick", category: "Neutral", attempts: 29, finishes: 21, goals: [], isCustom: false },
    { id: "t5", name: "Duck Under", category: "Neutral", attempts: 34, finishes: 26, goals: [], isCustom: false },
    { id: "t6", name: "Front Headlock", category: "Neutral", attempts: 41, finishes: 24, goals: [], isCustom: false },
    { id: "t7", name: "Cradle", category: "Top", attempts: 18, finishes: 12, goals: [], isCustom: false },
    { id: "t8", name: "Turk", category: "Top", attempts: 25, finishes: 19, goals: [], isCustom: false },
    { id: "t9", name: "Stand Up", category: "Bottom", attempts: 31, finishes: 25, goals: [], isCustom: false },
  ];

  const [techniques, setTechniques] = useState<Technique[]>(() => {
    const stored = localStorage.getItem("wrestlingTrackerTechniques");
    return stored ? JSON.parse(stored) : defaultTechniques;
  });

  const [wrestlingSystems, setWrestlingSystems] = useState<WrestlingSystem[]>(() => {
    const stored = localStorage.getItem("wrestlingTrackerSystems");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => { localStorage.setItem("wrestlingTrackerSessions", JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem("wrestlingTrackerGoal", JSON.stringify(goal)); }, [goal]);
  useEffect(() => { localStorage.setItem("wrestlingTrackerExercises", JSON.stringify(exercises)); }, [exercises]);
  useEffect(() => { localStorage.setItem("wrestlingTrackerPrograms", JSON.stringify(programs)); }, [programs]);
  useEffect(() => { localStorage.setItem("wrestlingTrackerPersonalRecords", JSON.stringify(personalRecords)); }, [personalRecords]);
  useEffect(() => { localStorage.setItem("wrestlingTrackerTechniqueVideos", JSON.stringify(techniqueVideos)); }, [techniqueVideos]);
  useEffect(() => { localStorage.setItem("wrestlingTrackerScheduledSessions", JSON.stringify(scheduledSessions)); }, [scheduledSessions]);
  useEffect(() => { localStorage.setItem("wrestlingTrackerTechniques", JSON.stringify(techniques)); }, [techniques]);
  useEffect(() => { localStorage.setItem("wrestlingTrackerSystems", JSON.stringify(wrestlingSystems)); }, [wrestlingSystems]);

  const addSession = (session: TrainingSession) => setSessions((prev) => [session, ...prev]);
  const updateSession = (id: string, session: TrainingSession) => setSessions((prev) => prev.map((s) => (s.id === id ? session : s)));
  const deleteSession = (id: string) => setSessions((prev) => prev.filter((s) => s.id !== id));

  const totalSparringRounds = sessions.reduce((acc, session) => {
    if (session.type === "Training" && session.hasSparring && session.rounds) return acc + session.rounds;
    if (session.type === "Sparring" && session.rounds) return acc + session.rounds;
    return acc;
  }, 0);

  const totalMatHours = sessions.reduce((acc, session) => {
    if ((session.type === "Training" && session.hasSparring || session.type === "Sparring") && session.rounds && session.roundDuration) {
      const minMatch = session.roundDuration.match(/(\d+)/);
      const roundMinutes = minMatch ? parseInt(minMatch[1]) : 0;
      return acc + (session.rounds * roundMinutes) / 60;
    }
    return acc;
  }, 0);

  const totalSessions = sessions.filter(s => s.type === "Training").length;

  const totalTrainingHours = sessions.reduce((acc, session) => {
    if (session.type === "Training") {
      const hourMatch = session.duration.match(/(\d+)h/);
      const minMatch = session.duration.match(/(\d+)m/);
      return acc + (hourMatch ? parseInt(hourMatch[1]) : 0) + (minMatch ? parseInt(minMatch[1]) : 0) / 60;
    }
    return acc;
  }, 0);

  const totalMatches = sessions.reduce((acc, session) => {
    if (session.type === "Competition" && session.matches) return acc + session.matches.length;
    return acc;
  }, 0);

  const addExercise = (exercise: Exercise) => setExercises((prev) => [...prev, exercise]);
  const updateExercise = (id: string, exercise: Exercise) => setExercises((prev) => prev.map((e) => (e.id === id ? exercise : e)));
  const deleteExercise = (id: string) => setExercises((prev) => prev.filter((e) => e.id !== id));

  const addProgram = (program: SCProgram) => setPrograms((prev) => [...prev, program]);
  const updateProgram = (id: string, program: SCProgram) => setPrograms((prev) => prev.map((p) => (p.id === id ? program : p)));
  const deleteProgram = (id: string) => setPrograms((prev) => prev.filter((p) => p.id !== id));

  const updatePersonalRecord = (pr: PersonalRecord) => {
    setPersonalRecords((prev) => {
      const existingIndex = prev.findIndex((record) => record.exerciseId === pr.exerciseId && record.sessionId === pr.sessionId);
      if (existingIndex !== -1) { const n = [...prev]; n[existingIndex] = pr; return n; }
      return [...prev, pr];
    });
  };
  const deletePersonalRecord = (exerciseId: string) => setPersonalRecords((prev) => prev.filter((pr) => pr.exerciseId !== exerciseId));
  const getPersonalRecord = (exerciseId: string) => personalRecords.find((pr) => pr.exerciseId === exerciseId);

  const addTechniqueVideo = (video: TechniqueVideo) => setTechniqueVideos((prev) => [...prev, video]);
  const updateTechniqueVideo = (id: string, video: TechniqueVideo) => setTechniqueVideos((prev) => prev.map((v) => (v.id === id ? video : v)));

  const addScheduledSession = (session: ScheduledSession) => setScheduledSessions((prev) => [...prev, session]);
  const deleteScheduledSession = (id: string) => setScheduledSessions((prev) => prev.filter((s) => s.id !== id));

  const addTechnique = (technique: Technique) => setTechniques((prev) => [...prev, technique]);
  const updateTechnique = (id: string, technique: Technique) => setTechniques((prev) => prev.map((t) => (t.id === id ? technique : t)));
  const deleteTechnique = (id: string) => setTechniques((prev) => prev.filter((t) => t.id !== id));

  const addWrestlingSystem = (system: WrestlingSystem) => setWrestlingSystems((prev) => [...prev, system]);
  const updateWrestlingSystem = (id: string, system: WrestlingSystem) => setWrestlingSystems((prev) => prev.map((s) => (s.id === id ? system : s)));
  const deleteWrestlingSystem = (id: string) => setWrestlingSystems((prev) => prev.filter((s) => s.id !== id));

  return (
    <DataContext.Provider value={{
      sessions, addSession, updateSession, deleteSession, goal, setGoal,
      totalMatHours, totalSessions, totalTrainingHours, totalMatches, totalSparringRounds,
      exercises, addExercise, updateExercise, deleteExercise,
      programs, addProgram, updateProgram, deleteProgram,
      personalRecords, updatePersonalRecord, deletePersonalRecord, getPersonalRecord,
      techniqueVideos, addTechniqueVideo, updateTechniqueVideo,
      scheduledSessions, addScheduledSession, deleteScheduledSession,
      techniques, addTechnique, updateTechnique, deleteTechnique,
      wrestlingSystems, addWrestlingSystem, updateWrestlingSystem, deleteWrestlingSystem,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}
