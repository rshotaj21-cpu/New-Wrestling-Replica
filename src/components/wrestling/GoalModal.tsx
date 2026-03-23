import { useState } from "react";
import { X, Target } from "lucide-react";
import { useData, TrainingGoal } from "@/context/DataContext";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalModal({ isOpen, onClose }: GoalModalProps) {
  const { goal, setGoal } = useData();
  const [goalType, setGoalType] = useState<"weekly" | "monthly">(goal.goalType || "weekly");
  const [selectedFrequency, setSelectedFrequency] = useState(goal.frequency);
  const [customTotal, setCustomTotal] = useState(goal.customTotal?.toString() || "");

  if (!isOpen) return null;

  const handleSave = () => {
    const newGoal: TrainingGoal = {
      frequency: selectedFrequency,
      customTotal: selectedFrequency === 0 && customTotal ? parseInt(customTotal) : undefined,
      goalType,
    };
    setGoal(newGoal);
    onClose();
  };

  const weeklyOptions = [
    { value: 1, label: "1× per week", monthly: 4 },
    { value: 2, label: "2× per week", monthly: 8 },
    { value: 3, label: "3× per week", monthly: 12 },
    { value: 4, label: "4× per week", monthly: 16 },
    { value: 5, label: "5× per week", monthly: 20 },
    { value: 0, label: "Custom", monthly: 0 },
  ];

  const monthlyOptions = [
    { value: 5, label: "5 per month" },
    { value: 8, label: "8 per month" },
    { value: 10, label: "10 per month" },
    { value: 15, label: "15 per month" },
    { value: 20, label: "20 per month" },
    { value: 0, label: "Custom" },
  ];

  const options = goalType === "weekly" ? weeklyOptions : monthlyOptions;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900">Training Goal</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Goal type toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Track by</label>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => { setGoalType("weekly"); setSelectedFrequency(goal.frequency || 3); }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${goalType === "weekly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              >
                Weekly
              </button>
              <button
                onClick={() => { setGoalType("monthly"); setSelectedFrequency(10); }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${goalType === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFrequency(option.value)}
                className={`w-full p-3.5 rounded-xl border-2 transition-all text-left ${
                  selectedFrequency === option.value ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{option.label}</div>
                    {goalType === "weekly" && option.value > 0 && (
                      <div className="text-xs text-gray-500">≈ {(option as typeof weeklyOptions[0]).monthly} sessions/month</div>
                    )}
                  </div>
                  {selectedFrequency === option.value && (
                    <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedFrequency === 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom {goalType === "monthly" ? "monthly" : "yearly"} target
              </label>
              <input
                type="number"
                value={customTotal}
                onChange={(e) => setCustomTotal(e.target.value)}
                placeholder={goalType === "monthly" ? "e.g., 12" : "e.g., 120"}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                min="1"
              />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm">
            Save Goal
          </button>
        </div>
      </div>
    </div>
  );
}
