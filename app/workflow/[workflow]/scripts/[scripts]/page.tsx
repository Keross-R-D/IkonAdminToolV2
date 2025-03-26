"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FileCode2, Save } from "lucide-react";

export default function ScriptPage() {
  const [scripts, setScripts] = useState<{ name: string; type: string; content: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newScriptName, setNewScriptName] = useState("");
  const [scriptType, setScriptType] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSaveAll = () => {
    console.log("Saving all scripts", scripts);
  };

  const handleCreateScript = () => {
    setNewScriptName("");
    setScriptType("");
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEditScript = (index: number) => {
    setNewScriptName(scripts[index].name);
    setScriptType(scripts[index].type);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSaveScript = () => {
    if (newScriptName.trim() && scriptType.trim()) {
      if (editingIndex !== null) {
        const updatedScripts = [...scripts];
        updatedScripts[editingIndex] = { name: newScriptName, type: scriptType, content: "" };
        setScripts(updatedScripts);
      } else {
        setScripts([...scripts, { name: newScriptName, type: scriptType, content: "" }]);
      }
      setScriptType("");
      setNewScriptName("");
      setEditingIndex(null);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4 justify-end">
        <Button onClick={handleSaveAll} variant="outline"><Save/> Save </Button>
        <Button onClick={handleCreateScript} variant="outline"><FileCode2 /> Create Script</Button>
      </div>

      <ul>
        {scripts.map((script, index) => (
          <li key={index} className="flex justify-between items-center">
            {script.name} // {script.type}
            <Button onClick={() => handleEditScript(index)} className="ml-4">Edit</Button>
          </li>
        ))}
      </ul>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Edit Script" : "Create New Script"}</DialogTitle>
          </DialogHeader>
          <div>
          <Input
            value={newScriptName}
            onChange={(e) => setNewScriptName(e.target.value)}
            placeholder="Enter script name"
          />
          <Select value={scriptType} onValueChange={setScriptType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select script type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="shell">Shell</SelectItem>
            </SelectContent>
          </Select>
          
          </div>
          <DialogFooter>
            <Button onClick={handleSaveScript}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
