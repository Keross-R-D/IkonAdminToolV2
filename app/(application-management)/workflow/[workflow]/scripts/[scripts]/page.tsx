"use client"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Delete, Edit, FileCode2, Save, Trash, Trash2 } from "lucide-react";
import { RenderAppBreadcrumb } from "@/ikon/components/app-breadcrumb";
import { useParams } from "next/navigation";
import { Tooltip } from "@/ikon/components/tooltip";
import { LoadingSpinner } from "@/ikon/components/loading-spinner";
import { set } from "zod";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';


export default function ScriptPage() {
  const [scripts, setScripts] = useState<{ scriptId: string; scriptName: string; scriptType: string; scriptLanguage : string}[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newScriptName, setNewScriptName] = useState("");
  const [scriptType, setScriptType] = useState("");
  const [scriptLangType, setScriptLangType] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
    const createScriptFile = async () => {
      setIsLoading(true);
      const response = await fetch("/api/read-script-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: params?.workflow,
        }),
      });
debugger;
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to Create script file");
      } 
      const data = await response.json();
      setIsLoading(false);
      setScripts(data.metadata); // Assuming the response contains an array of scripts
    };

    createScriptFile().catch((err) => console.error("❌ Error in useEffect:", err));
  }, []);

  const handleSaveAll = () => {
    console.log("Saving all scripts", scripts);
  };

  const handleCreateScript = () => {
    setNewScriptName("");
    setScriptType("");
    setScriptLangType("");
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEditScript = (index: number) => {
    setNewScriptName(scripts[index].scriptName);
    setScriptType(scripts[index].scriptType);
    setScriptLangType(scripts[index].scriptLanguage);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSaveScript = async () => {
    debugger
    
    if (newScriptName.trim() && scriptType.trim() && scriptLangType.trim()) {
      
      setIsDialogOpen(false);
      setIsLoading(true);
      if (editingIndex !== null) {
        const updatedScripts = [...scripts];
        updatedScripts[editingIndex] = { scriptName: newScriptName, scriptType: scriptType , scriptId: scripts[editingIndex]?.scriptId, scriptLanguage: scriptLangType};
        debugger
        try {
          const response = await fetch("/api/update-script-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folderId : params?.workflow,
              fileId : scripts[editingIndex]?.scriptId,
              fileName: newScriptName,
              type: scriptType,
              langType: scriptLangType
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to Create script file");
          }
          else{
            setIsLoading(false);
            toast.success("Script file updated successfully!");
          }
        } catch (err) {
          console.error("❌  Create script file error :", err);
          alert("Failed to Create script file. Please try again.");
          
          setIsDialogOpen(true);
          return;
        }
       
        setScripts(updatedScripts);
      } else {
        // Create new script
        const newScriptId = uuidv4(); // or use randomUUID() if you prefer
        try {
          
          const response = await fetch("/api/update-script-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folderId : params?.workflow,
              fileId : newScriptId,
              fileName: newScriptName,
              type: scriptType,
              langType: scriptLangType
            }),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to Create script file");
            
          }
          else {
            setIsLoading(false);
            toast.success("Script file created successfully!");
          }
        } catch (err) {
          console.error("❌  Create script file error :", err);
          alert("Failed to Create script file. Please try again.");
          
          setIsDialogOpen(true);
          return;
        }
        setScripts([...scripts, { scriptName: newScriptName, scriptType: scriptType, scriptId: newScriptId, scriptLanguage: scriptLangType }]);
      }
      setScriptType("");
      setScriptLangType("");
      setNewScriptName("");
      setEditingIndex(null);
    }
  };
  const handleScriptDeletion = async (index: number) => {
    debugger
    const updatedScripts = [...scripts];
    setIsLoading(true);
    try {
      debugger
      const response = await fetch("/api/delete-script-file", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId : params?.workflow,
          scriptId : updatedScripts[index]?.scriptId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to Delete script file");
      }
      else {
        setIsLoading(false);
        toast.success("Script file deleted successfully!");
        const data = await response.json();
        if(data.fs){
          setScripts(data.fs); // Assuming the response contains an array of scripts
        }
      }
      //window.location.reload();
    } catch (err) {
      console.error("❌  Delete script file error :", err);
      alert("Failed to Delete script file. Please try again.");
      return;
    } 
  }
  const showscripts = () => {
    // if(scripts.length === 0) {
    //   return <div className="p-4">No scripts found.</div>;
    // }
    // else {
      return (
        <>
        
        <div className={"flex flex-col gap-2 p-2 grow  overflow-y-auto "}>
        
          
        {scripts.map((script, index) => (
          <div
            key={index}
            className="flex items-center justify-between border rounded-xl shadow-sm px-4 py-3  w-full max-w-full"
          >
            <div className="flex items-center gap-2">
              <FileCode2 />
              <div className="text-sm text-gray-800 dark:text-white font-medium">
                <div className="flex "> {script.scriptName}</div>
                <div className="text-xs text-gray-500">{script.scriptLanguage} · {script.scriptType}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Tooltip tooltipContent="Edit Script" side={"top"}>
                <Button onClick={() => handleEditScript(index)} variant="outline" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip tooltipContent="Delete Script" side={"top"}>
                <Button onClick={() => handleScriptDeletion(index)} variant="outline" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
      </>
      );
    // }
  }

  return (

    <div className="p-4 h-full">
      <LoadingSpinner visible={isLoading} />
      <RenderAppBreadcrumb breadcrumb={{ level: 2, title: "Scripts", href: `/workflow/${params.workflow}/scripts/${params.workflow}` }} />
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
        <div className="flex gap-2 mb-2 justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">Scripts</h1>
          <div className="flex gap-2">
            <Tooltip tooltipContent="Save All Scripts" side={"top"}>
              <Button onClick={handleSaveAll} variant="outline" size='icon' className="hidden"><Save/> </Button>
            </Tooltip>
            <Tooltip tooltipContent="Create New Script" side={"top"}>
              <Button onClick={handleCreateScript} variant="outline" size='icon'><FileCode2 /> </Button>
            </Tooltip>
            
            
          </div>
        </div>
        {showscripts()}
      </div>
      

      

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Edit Script" : "Create New Script"}</DialogTitle>
          </DialogHeader>
          <div>
            <div>
              <Input
                value={newScriptName}
                onChange={(e) => setNewScriptName(e.target.value)}
                placeholder="Enter script name"
              />
            </div>
            <div className="mt-2">
              <Select value={scriptLangType} onValueChange={setScriptLangType}> 
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select script language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JavaScript">JavaScript</SelectItem> 
                  <SelectItem value="Python">Python</SelectItem> 
                  <SelectItem value="Modular JavaScript">Modular JavaScript</SelectItem>
                  
                </SelectContent>
              </Select>
            
            </div>
            <div className="mt-2">
              <Select value={scriptType} onValueChange={setScriptType}> 
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select script type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Message Variable">Message Variable</SelectItem> 
                  <SelectItem value="Instance Delete Hook">Instance Delete Hook</SelectItem> 
                  <SelectItem value="Common Action Validation">Common Action Validation</SelectItem>
                  <SelectItem value="Process Delete Hook">Process Delete Hook</SelectItem>
                  <SelectItem value="Instance Backup - Id Processing Script">Instance Backup - Id Processing Script</SelectItem>
                  <SelectItem value="Data Processor">Data Processor</SelectItem>
                  <SelectItem value="Error Handler">Error Handler</SelectItem>
                  <SelectItem value="Multipart Data Processor">Multipart Data Processor</SelectItem>
                  <SelectItem value="Process Condition">Process Condition</SelectItem>
                  <SelectItem value="Transition Action - Before Transaction">Transition Action - Before Transaction</SelectItem>
                  <SelectItem value="Transition Action - After Transaction">Transition Action - After Transaction</SelectItem>
                  <SelectItem value="Form Data Post Processing">Form Data Post Processing</SelectItem>
                  <SelectItem value="Task Action">Task Action</SelectItem>
                  <SelectItem value="Assignee Definition">Assignee Definition</SelectItem>
                  <SelectItem value="Job Script">Job Script</SelectItem>
                </SelectContent>
              </Select>
            
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveScript}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

