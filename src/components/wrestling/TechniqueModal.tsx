import { useState } from "react";
import { X, Plus, Trash2, Video } from "lucide-react";
import { Technique } from "@/context/DataContext";

interface TechniqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (technique: Technique) => void;
  techniqueToEdit?: Technique;
}

export function TechniqueModal({ isOpen, onClose, onSave, techniqueToEdit }: TechniqueModalProps) {
  const [name, setName] = useState(techniqueToEdit?.name || "");
  const [category, setCategory] = useState<Technique["category"]>(techniqueToEdit?.category || "Neutral");
  const [setups, setSetups] = useState<string[]>(techniqueToEdit?.setups || []);
  const [newSetup, setNewSetup] = useState("");
  const [videoLinks, setVideoLinks] = useState<Array<{ url: string; title: string }>>(techniqueToEdit?.videoLinks || []);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    const technique: Technique = {
      id: techniqueToEdit?.id || `tech-${Date.now()}`,
      name: name.trim(),
      category,
      attempts: techniqueToEdit?.attempts || 0,
      finishes: techniqueToEdit?.finishes || 0,
      videoLinks,
      setups,
      goals: techniqueToEdit?.goals || [],
      isCustom: true,
    };
    onSave(technique);
    onClose();
  };

  const addSetup = () => {
    if (newSetup.trim()) {
      setSetups([...setups, newSetup.trim()]);
      setNewSetup("");
    }
  };

  const addVideoLink = () => {
    if (newVideoUrl.trim()) {
      setVideoLinks([...videoLinks, { url: newVideoUrl.trim(), title: newVideoTitle.trim() || "Untitled" }]);
      setNewVideoUrl("");
      setNewVideoTitle("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{techniqueToEdit ? "Edit Technique" : "Add Technique"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Double Leg" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Position</label>
            <div className="flex gap-2">
              {(["Neutral", "Top", "Bottom"] as const).map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${category === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Setups */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Setups</label>
            <p className="text-xs text-gray-400 mb-2">What setups work well with this technique?</p>
            {setups.map((s, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <span className="flex-1 text-sm bg-gray-50 px-3 py-1.5 rounded-lg">{s}</span>
                <button onClick={() => setSetups(setups.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={newSetup} onChange={(e) => setNewSetup(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSetup()} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="e.g. Snap down to shot" />
              <button onClick={addSetup} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Video Links */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1"><Video className="w-4 h-4" />Video Links</label>
            <p className="text-xs text-gray-400 mb-2">Add YouTube links for reference</p>
            {videoLinks.map((v, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <div className="flex-1 text-sm bg-gray-50 px-3 py-1.5 rounded-lg truncate">
                  <span className="font-medium">{v.title}</span>
                </div>
                <button onClick={() => setVideoLinks(videoLinks.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="space-y-1.5">
              <input value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="Video title" />
              <div className="flex gap-2">
                <input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="YouTube URL" />
                <button onClick={addVideoLink} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim()} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>
  );
}
