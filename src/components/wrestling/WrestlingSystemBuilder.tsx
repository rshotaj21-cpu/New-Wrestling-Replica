import { useState, useCallback, useRef, useEffect } from "react";
import { useData, WrestlingSystem, SystemNode, SystemConnection } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowLeft, Link2, Unlink, GripVertical, Edit2, Zap, Shield, Swords, ArrowUpCircle, ArrowDownCircle, Target, RotateCcw } from "lucide-react";
import { SystemNodeModal } from "./SystemNodeModal";
import { toast } from "sonner";
import { FileDown } from "lucide-react";

const STARTER_TEMPLATE: Omit<WrestlingSystem, "id" | "createdDate"> = {
  name: "Neutral Game — Single Leg System",
  description: "A complete neutral game plan: read triggers → setup → primary attack → backups if it fails → top & bottom transitions",
  nodes: [
    { id: "t1", type: "trigger", label: "Opponent pressures forward", description: "They step in or push into you — weight on front foot", position: { x: 60, y: 40 } },
    { id: "t2", type: "trigger", label: "Tall / upright stance", description: "Head high, hips back — exposed lead leg", position: { x: 300, y: 40 } },
    { id: "t3", type: "trigger", label: "Head snapped down", description: "After a snap-down they're bent at the waist", position: { x: 540, y: 40 } },
    { id: "s1", type: "setup", label: "Snap & go", description: "Snap the head down then level-change immediately", position: { x: 60, y: 180 } },
    { id: "s2", type: "setup", label: "Inside tie to drag", description: "Collar tie → arm drag to expose the leg", position: { x: 300, y: 180 } },
    { id: "s3", type: "setup", label: "Fake high-crotch", description: "Fake high-crotch to draw a reaction, then hit single", position: { x: 540, y: 180 } },
    { id: "a1", type: "attack", label: "Single Leg", description: "Head-inside single leg — drive through the hip", position: { x: 300, y: 330 } },
    { id: "b1", type: "backup", label: "Double Leg", description: "If single is stuffed — re-shoot to double", position: { x: 60, y: 470 } },
    { id: "b2", type: "backup", label: "High Crotch", description: "Switch to high crotch if they whizzer hard", position: { x: 300, y: 470 } },
    { id: "b3", type: "backup", label: "Ankle pick", description: "Back out and snap to ankle pick", position: { x: 540, y: 470 } },
    { id: "top1", type: "top", label: "Tight waist + chop", description: "Secure tight waist, chop the arm for a turn", position: { x: 120, y: 610 } },
    { id: "top2", type: "top", label: "Leg riding", description: "Insert legs to break them down and control", position: { x: 380, y: 610 } },
    { id: "bot1", type: "bottom", label: "Stand up", description: "Hand control → stand up → clear hips", position: { x: 120, y: 740 } },
    { id: "def1", type: "defence", label: "Sprawl & crossface", description: "Hip back hard and drive crossface to re-square", position: { x: 540, y: 610 } },
  ],
  connections: [
    { id: "c1", fromId: "t1", toId: "s1", condition: "default" },
    { id: "c2", fromId: "t2", toId: "s2", condition: "default" },
    { id: "c3", fromId: "t3", toId: "s3", condition: "default" },
    { id: "c4", fromId: "s1", toId: "a1", condition: "success" },
    { id: "c5", fromId: "s2", toId: "a1", condition: "success" },
    { id: "c6", fromId: "s3", toId: "a1", condition: "success" },
    { id: "c7", fromId: "a1", toId: "top1", condition: "success" },
    { id: "c8", fromId: "a1", toId: "b1", condition: "fail" },
    { id: "c9", fromId: "a1", toId: "b2", condition: "fail" },
    { id: "c10", fromId: "b1", toId: "top2", condition: "success" },
    { id: "c11", fromId: "b1", toId: "b3", condition: "fail" },
    { id: "c12", fromId: "b2", toId: "top1", condition: "success" },
    { id: "c13", fromId: "a1", toId: "bot1", condition: "fail" },
    { id: "c14", fromId: "def1", toId: "s1", condition: "success" },
  ],
};

const NODE_COLORS: Record<SystemNode["type"], string> = {
  trigger: "border-amber-400 bg-amber-50 text-amber-900",
  setup: "border-blue-400 bg-blue-50 text-blue-900",
  attack: "border-red-400 bg-red-50 text-red-900",
  backup: "border-orange-400 bg-orange-50 text-orange-900",
  top: "border-green-400 bg-green-50 text-green-900",
  bottom: "border-purple-400 bg-purple-50 text-purple-900",
  defence: "border-slate-400 bg-slate-50 text-slate-900",
};

const NODE_ICONS: Record<SystemNode["type"], typeof Zap> = {
  trigger: Zap,
  setup: Target,
  attack: Swords,
  backup: RotateCcw,
  top: ArrowUpCircle,
  bottom: ArrowDownCircle,
  defence: Shield,
};

const NODE_LABELS: Record<SystemNode["type"], string> = {
  trigger: "Trigger",
  setup: "Setup",
  attack: "Attack",
  backup: "Backup",
  top: "Top",
  bottom: "Bottom",
  defence: "Defence",
};

const CONDITION_COLORS: Record<string, string> = {
  success: "stroke-green-500",
  fail: "stroke-red-400",
  default: "stroke-muted-foreground",
};

export function WrestlingSystemBuilder() {
  const { wrestlingSystems, addWrestlingSystem, updateWrestlingSystem, deleteWrestlingSystem } = useData();
  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<SystemNode | undefined>();
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const activeSystem = wrestlingSystems.find((s) => s.id === activeSystemId);

  const createSystem = () => {
    if (!newName.trim()) return;
    const system: WrestlingSystem = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      description: newDesc.trim() || undefined,
      nodes: [],
      connections: [],
      createdDate: new Date().toISOString().split("T")[0],
    };
    addWrestlingSystem(system);
    setActiveSystemId(system.id);
    setShowCreateDialog(false);
    setNewName("");
    setNewDesc("");
    toast.success("System created");
  };

  const loadTemplate = () => {
    const system: WrestlingSystem = {
      id: crypto.randomUUID(),
      ...STARTER_TEMPLATE,
      nodes: STARTER_TEMPLATE.nodes.map((n) => ({ ...n, id: `${n.id}-${Date.now()}` })),
      connections: STARTER_TEMPLATE.connections.map((c) => ({
        ...c,
        id: `${c.id}-${Date.now()}`,
        fromId: `${c.fromId}-${Date.now()}`,
        toId: `${c.toId}-${Date.now()}`,
      })),
      createdDate: new Date().toISOString().split("T")[0],
    };
    addWrestlingSystem(system);
    setActiveSystemId(system.id);
    toast.success("Template loaded — customise it to fit your game");
  };

  const handleDeleteSystem = (id: string) => {
    deleteWrestlingSystem(id);
    if (activeSystemId === id) setActiveSystemId(null);
    toast.success("System deleted");
  };

  const addNode = (node: SystemNode) => {
    if (!activeSystem) return;
    const existingNodes = activeSystem.nodes;
    // Auto-position based on type
    const typeOrder: SystemNode["type"][] = ["trigger", "setup", "attack", "backup", "top", "bottom", "defence"];
    const row = typeOrder.indexOf(node.type);
    const sameType = existingNodes.filter((n) => n.type === node.type);
    const col = sameType.length;
    node.position = { x: 40 + col * 200, y: 40 + row * 120 };
    
    const updated = { ...activeSystem, nodes: [...existingNodes, node] };
    updateWrestlingSystem(activeSystem.id, updated);
  };

  const updateNode = (node: SystemNode) => {
    if (!activeSystem) return;
    const updated = { ...activeSystem, nodes: activeSystem.nodes.map((n) => (n.id === node.id ? node : n)) };
    updateWrestlingSystem(activeSystem.id, updated);
  };

  const deleteNode = (nodeId: string) => {
    if (!activeSystem) return;
    const updated = {
      ...activeSystem,
      nodes: activeSystem.nodes.filter((n) => n.id !== nodeId),
      connections: activeSystem.connections.filter((c) => c.fromId !== nodeId && c.toId !== nodeId),
    };
    updateWrestlingSystem(activeSystem.id, updated);
  };

  const handleNodeClick = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      if (!activeSystem) return;
      const exists = activeSystem.connections.some((c) => c.fromId === connectingFrom && c.toId === nodeId);
      if (!exists) {
        const conn: SystemConnection = {
          id: crypto.randomUUID(),
          fromId: connectingFrom,
          toId: nodeId,
          condition: "default",
        };
        const updated = { ...activeSystem, connections: [...activeSystem.connections, conn] };
        updateWrestlingSystem(activeSystem.id, updated);
        toast.success("Connected");
      }
      setConnectingFrom(null);
    }
  };

  const toggleConnectionCondition = (connId: string) => {
    if (!activeSystem) return;
    const conditions: Array<"default" | "success" | "fail"> = ["default", "success", "fail"];
    const updated = {
      ...activeSystem,
      connections: activeSystem.connections.map((c) => {
        if (c.id !== connId) return c;
        const idx = conditions.indexOf(c.condition || "default");
        return { ...c, condition: conditions[(idx + 1) % conditions.length] };
      }),
    };
    updateWrestlingSystem(activeSystem.id, updated);
  };

  const deleteConnection = (connId: string) => {
    if (!activeSystem) return;
    const updated = { ...activeSystem, connections: activeSystem.connections.filter((c) => c.id !== connId) };
    updateWrestlingSystem(activeSystem.id, updated);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (connectingFrom) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const node = activeSystem?.nodes.find((n) => n.id === nodeId);
    if (!rect || !node) return;
    setDragNode(nodeId);
    setDragOffset({ x: e.clientX - rect.left - node.position.x, y: e.clientY - rect.top - node.position.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragNode || !activeSystem || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
      const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
      const updated = {
        ...activeSystem,
        nodes: activeSystem.nodes.map((n) => (n.id === dragNode ? { ...n, position: { x, y } } : n)),
      };
      updateWrestlingSystem(activeSystem.id, updated);
    },
    [dragNode, activeSystem, dragOffset, updateWrestlingSystem]
  );

  const handleMouseUp = () => setDragNode(null);

  const getNodeCenter = (node: SystemNode) => ({
    x: node.position.x + 80,
    y: node.position.y + 30,
  });

  // System list view
  if (!activeSystem) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Wrestling Systems</h2>
            <p className="text-sm text-muted-foreground">Build your game plan as a decision tree</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadTemplate} size="sm" variant="outline">
              <FileDown className="w-4 h-4 mr-1" /> Load Template
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" /> New System
            </Button>
          </div>
        </div>

        {wrestlingSystems.length === 0 ? (
          <Card className="p-8 text-center">
            <Swords className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No systems yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your wrestling game plan — map setups, attacks, backups, and transitions
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={loadTemplate}>
                <FileDown className="w-4 h-4 mr-1" /> Load Starter Template
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-1" /> Create Blank System
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {wrestlingSystems.map((sys) => (
              <Card
                key={sys.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                onClick={() => setActiveSystemId(sys.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{sys.name}</h3>
                    {sys.description && <p className="text-sm text-muted-foreground">{sys.description}</p>}
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{sys.nodes.length} nodes</span>
                      <span>·</span>
                      <span>{sys.connections.length} connections</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDeleteSystem(sys.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Wrestling System</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. My Neutral Game" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description (optional)</label>
                <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What this system covers" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={createSystem} disabled={!newName.trim()}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Flowchart builder view
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="p-3 border-b border-border bg-card flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => setActiveSystemId(null)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{activeSystem.name}</h2>
          {activeSystem.description && <p className="text-xs text-muted-foreground truncate">{activeSystem.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={connectingFrom ? "destructive" : "outline"}
            onClick={() => setConnectingFrom(connectingFrom ? null : "__waiting__")}
          >
            {connectingFrom ? <><Unlink className="w-3 h-3 mr-1" /> Cancel</> : <><Link2 className="w-3 h-3 mr-1" /> Connect</>}
          </Button>
          <Button size="sm" onClick={() => { setEditingNode(undefined); setNodeModalOpen(true); }}>
            <Plus className="w-3 h-3 mr-1" /> Add Node
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-3 py-2 bg-muted/50 border-b border-border flex gap-3 flex-wrap text-xs">
        {(Object.entries(NODE_LABELS) as [SystemNode["type"], string][]).map(([type, label]) => {
          const Icon = NODE_ICONS[type];
          return (
            <span key={type} className={`flex items-center gap-1 px-2 py-0.5 rounded border ${NODE_COLORS[type]}`}>
              <Icon className="w-3 h-3" /> {label}
            </span>
          );
        })}
      </div>

      {connectingFrom && connectingFrom !== "__waiting__" && (
        <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-200 text-xs text-blue-700 font-medium">
          Click another node to connect from "{activeSystem.nodes.find((n) => n.id === connectingFrom)?.label}"
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-[hsl(var(--muted)/0.3)] select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ minHeight: 600 }}
      >
        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 1200, minHeight: 800 }}>
          {activeSystem.connections.map((conn) => {
            const from = activeSystem.nodes.find((n) => n.id === conn.fromId);
            const to = activeSystem.nodes.find((n) => n.id === conn.toId);
            if (!from || !to) return null;
            const fc = getNodeCenter(from);
            const tc = getNodeCenter(to);
            const mx = (fc.x + tc.x) / 2;
            const my = (fc.y + tc.y) / 2;
            const colorClass = CONDITION_COLORS[conn.condition || "default"];
            return (
              <g key={conn.id} className="pointer-events-auto cursor-pointer" onClick={() => toggleConnectionCondition(conn.id)} onDoubleClick={() => deleteConnection(conn.id)}>
                <path
                  d={`M ${fc.x} ${fc.y} Q ${mx} ${fc.y} ${mx} ${my} Q ${mx} ${tc.y} ${tc.x} ${tc.y}`}
                  fill="none"
                  className={`${colorClass} stroke-2`}
                  markerEnd="url(#arrowhead)"
                />
                {conn.condition && conn.condition !== "default" && (
                  <text x={mx} y={my - 8} textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium pointer-events-none">
                    {conn.condition === "success" ? "✓ Success" : "✗ Fails"}
                  </text>
                )}
              </g>
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" className="fill-muted-foreground" />
            </marker>
          </defs>
        </svg>

        {/* Nodes */}
        {activeSystem.nodes.map((node) => {
          const Icon = NODE_ICONS[node.type];
          return (
            <div
              key={node.id}
              className={`absolute rounded-lg border-2 px-3 py-2 shadow-sm min-w-[160px] max-w-[200px] cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${NODE_COLORS[node.type]} ${
                connectingFrom === node.id ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ left: node.position.x, top: node.position.y }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={() => {
                if (connectingFrom === "__waiting__") {
                  setConnectingFrom(node.id);
                } else if (connectingFrom) {
                  handleNodeClick(node.id);
                }
              }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <GripVertical className="w-3 h-3 opacity-40 shrink-0" />
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold text-xs uppercase tracking-wide">{NODE_LABELS[node.type]}</span>
              </div>
              <p className="text-sm font-medium leading-tight">{node.label}</p>
              {node.description && <p className="text-[11px] mt-0.5 opacity-70 leading-snug">{node.description}</p>}
              <div className="flex gap-1 mt-1.5">
                <button
                  className="p-0.5 rounded hover:bg-black/10 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setEditingNode(node); setNodeModalOpen(true); }}
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  className="p-0.5 rounded hover:bg-red-200 transition-colors"
                  onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {activeSystem.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Swords className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Add nodes to build your system</p>
              <p className="text-xs text-muted-foreground mt-1">Start with a trigger or setup, then connect attacks & backups</p>
            </div>
          </div>
        )}
      </div>

      {/* Connection instructions */}
      <div className="px-3 py-2 border-t border-border bg-card text-xs text-muted-foreground">
        <span className="font-medium">Tip:</span> Click "Connect" → click source node → click target. Click a line to cycle condition (default → success → fail). Double-click line to delete.
      </div>

      <SystemNodeModal
        isOpen={nodeModalOpen}
        onClose={() => { setNodeModalOpen(false); setEditingNode(undefined); }}
        onSave={(node) => editingNode ? updateNode(node) : addNode(node)}
        nodeToEdit={editingNode}
      />
    </div>
  );
}
