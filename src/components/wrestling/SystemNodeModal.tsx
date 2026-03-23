import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData, SystemNode } from "@/context/DataContext";

interface SystemNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: SystemNode) => void;
  nodeToEdit?: SystemNode;
}

const nodeTypes = [
  { value: "trigger", label: "Shot Trigger", color: "bg-amber-500" },
  { value: "setup", label: "Setup", color: "bg-blue-500" },
  { value: "attack", label: "Go-To Attack", color: "bg-red-500" },
  { value: "backup", label: "Backup Option", color: "bg-orange-500" },
  { value: "top", label: "Top Game", color: "bg-green-500" },
  { value: "bottom", label: "Bottom Escape", color: "bg-purple-500" },
  { value: "defence", label: "Defence", color: "bg-slate-500" },
] as const;

export function SystemNodeModal({ isOpen, onClose, onSave, nodeToEdit }: SystemNodeModalProps) {
  const { techniques } = useData();
  const [label, setLabel] = useState("");
  const [type, setType] = useState<SystemNode["type"]>("attack");
  const [description, setDescription] = useState("");
  const [techniqueId, setTechniqueId] = useState("");

  useEffect(() => {
    if (nodeToEdit) {
      setLabel(nodeToEdit.label);
      setType(nodeToEdit.type);
      setDescription(nodeToEdit.description || "");
      setTechniqueId(nodeToEdit.techniqueId || "");
    } else {
      setLabel("");
      setType("attack");
      setDescription("");
      setTechniqueId("");
    }
  }, [nodeToEdit, isOpen]);

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      id: nodeToEdit?.id || crypto.randomUUID(),
      type,
      label: label.trim(),
      description: description.trim() || undefined,
      techniqueId: techniqueId || undefined,
      position: nodeToEdit?.position || { x: 0, y: 0 },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{nodeToEdit ? "Edit Node" : "Add Node"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as SystemNode["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {nodeTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Blast Double" />
          </div>
          <div>
            <Label>Link to Technique (optional)</Label>
            <Select value={techniqueId} onValueChange={setTechniqueId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {techniques.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description / Notes</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="When to use this, key details..." rows={3} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!label.trim()}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
